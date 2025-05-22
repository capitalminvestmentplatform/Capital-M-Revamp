"use client";
import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { calculatePortfolioSums, getLoggedInUser } from "@/utils/client";
import {
  AggregatedClosingBalanceProps,
  PortfolioItemProps,
} from "@/types/pandaConnect";
import Charts from "@/app/components/Charts";
import { toast } from "sonner";
import { InvestmentProps } from "@/types/investments";
import Link from "next/link";
import InvestmentCard from "../components/investments/InvestmentCard";

const DashboardPage: React.FC = () => {
  const { role, name } = getLoggedInUser() || { role: "" };

  const [userTotalPortfolio, setUserTotalPortfolio] = useState<
    PortfolioItemProps[]
  >([]);
  const [userClosingBalance, setUserClosingBalance] = useState<
    AggregatedClosingBalanceProps[]
  >([]);
  const [closingBalanceData, setClosingBalanceData] = useState<number[]>([]);
  const [marketValuesData, setMarketValuesData] = useState<number[]>([]);
  const [costPriceData, setCostPriceData] = useState<number[]>([]);
  const [investments, setInvestments] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [category, setCategory] = useState("all");
  const [view, setView] = useState("grid");

  useEffect(() => {
    if (role !== "Admin") getUserData();
    fetchInvestments();
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/categories");
      if (!res.ok) {
        throw new Error("Network res was not ok");
      }
      const response = await res.json();

      if (response.statusCode !== 200) {
        toast.error(response.message);
        throw new Error(response.message);
      }
      const categories = response.data;
      setCategories(categories);
    } catch (error) {
      return (error as Error).message;
    }
  };

  const fetchInvestments = async () => {
    try {
      const res = await fetch("/api/products");

      const response = await res.json();
      if (response.statusCode !== 200) {
        toast.error(response.message);
        throw new Error(response.message);
      }

      const investments = response.data;
      setInvestments(investments);
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: "DELETE",
      });

      const response = await res.json();
      if (response.statusCode !== 200) {
        toast.error(response.message);
        throw new Error(response.message);
      }

      toast.success(response.message);
      fetchInvestments(); // Refresh the investments list
    } catch (error) {
      setError((error as Error).message);
    }
  };

  const createCharts = (
    userTP?: PortfolioItemProps[],
    userCB?: AggregatedClosingBalanceProps[]
  ) => {
    let mvArray: number[] = [];
    let cpArray: number[] = [];
    let currentTP = userTP || userTotalPortfolio;
    let currentCB = userCB || userClosingBalance;

    const categoryOrder = ["Cash", "Equity", "Fixed Income", "Real Estate"];
    const filteredTP = currentTP;
    const groupedData = filteredTP.reduce<
      Record<string, { marketValue: number; costPrice: number }>
    >((acc, item) => {
      const { category, marketValue, costPrice } = item;
      if (!acc[category]) {
        acc[category] = { marketValue: 0, costPrice: 0 };
      }
      acc[category].marketValue += marketValue;
      acc[category].costPrice += costPrice;
      return acc;
    }, {});

    categoryOrder.forEach((category) => {
      mvArray.push(groupedData[category]?.marketValue || 0);
      cpArray.push(groupedData[category]?.costPrice || 0);
    });

    setMarketValuesData(mvArray);
    setCostPriceData(cpArray);

    const filteredCB = currentCB[0];
    const extractedArray = ["cash", "equity", "fixedIncome", "realEstate"].map(
      (key) => filteredCB?.[key as keyof AggregatedClosingBalanceProps] ?? 0
    );
    setClosingBalanceData(
      extractedArray.map((item) => (typeof item === "number" ? item : 0))
    );
  };

  const fetchMalcoAssets = async () => {
    try {
      const res = await fetch("/api/malco-assets", {
        method: "GET",
        credentials: "include", // Ensure cookies are sent if authentication is needed
      });

      const response = await res.json();

      if (response.statusCode !== 200) {
        toast.error(response.message);
        throw new Error(response.message);
      }

      const malcoAssets = response.data;

      return malcoAssets;
    } catch (error) {
      console.log((error as Error).message);
    } finally {
    }
  };

  const getUserData = async () => {
    let portfolioData: PortfolioItemProps[] = [];

    const { portfolioId } = getLoggedInUser() || { portfolioId: "" };

    const malcoAssets = await fetchMalcoAssets();
    try {
      const res = await fetch("/api/panda-connect", {
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify({ id: portfolioId }),
      });

      let response = await res.json();

      if (response.statusCode !== 200) {
        toast.error(response.message);
        throw new Error(response.message);
      }

      let maData = response.data;

      maData = maData.filter((item: any) => item.mv !== 0);
      maData = maData.map((item: any) => {
        const filteredAsset = malcoAssets.find(
          (asset: any) => asset.longName === item.name
        );
        return {
          category: filteredAsset?.category,
          subCategory: filteredAsset?.subCategory,
          userAsset: filteredAsset?.longName,
          costPrice: Math.trunc(Math.abs(item.cp)),
          marketValue: Math.trunc(Math.abs(item.mv)),
          initialCost: Math.trunc(Math.abs(item.ic)),
        };
      });
      maData = maData.filter((item: any) => item.category !== undefined);
      portfolioData = maData;
      setUserTotalPortfolio(maData);
    } catch (error) {
      console.log((error as Error).message);
    }

    const userCB = calculatePortfolioSums(portfolioData || []);

    setUserClosingBalance(userCB);

    createCharts(portfolioData, userCB);
  };

  const filteredInvestments =
    investments.length > 0 &&
    investments.filter((investment: InvestmentProps) => {
      const isCategoryMatch =
        category === "all" || investment.category === category;

      const today = new Date();
      const expirationDate = investment.expirationDate
        ? new Date(investment.expirationDate)
        : null;

      const isNotExpired = expirationDate ? expirationDate >= today : true;

      if (role === "Admin") {
        // ✅ Admin can see everything
        return isCategoryMatch;
      } else {
        return isCategoryMatch && isNotExpired && !!investment.status;
      }
    });

  return (
    <div className="container mx-auto max-w-[1440px] px-4">
      <p className="text-2xl mb-1 font-semibold">
        Welcome {name} - Current Statement Insights
      </p>
      <p className="text-sm text-gray-500 mb-5">
        From here, you can access all your investment information and manage
        your account portfolio.
      </p>

      {role !== "Admin" && (
        <div className="">
          <div className="mt-5">
            <h2 className="mb-5 text-lg font-semibold">Charts</h2>
            <div className="flex flex-col lg:flex-row gap-8 mb-5">
              {/* Left side: Bar chart */}
              <div className="w-full lg:w-2/3">
                <h4 className="font-medium mb-2">Total Portfolio</h4>
                <div id="chart" className="bg-white p-4">
                  <Charts
                    type="Bar"
                    dataset1={{ label: "Market Value", data: marketValuesData }}
                    dataset2={{ label: "Cost Price", data: costPriceData }}
                    labels={["Cash", "Equity", "Fixed Income", "Real Estate"]}
                  />
                </div>
              </div>

              {/* Right side: Pie chart */}
              <div className="w-full lg:w-1/3" style={{ height: "330px" }}>
                <h4 className="font-medium mb-2">Portfolio Value</h4>
                <div className="bg-white p-4 h-full">
                  <Charts
                    type="Pie"
                    dataset1={{
                      label: "Closing Balance",
                      data: closingBalanceData,
                    }}
                    labels={["Cash", "Equity", "Fixed Income", "Real Estate"]}
                  />
                </div>
              </div>
            </div>
          </div>
          <hr />
          <p className="my-5 text-lg font-semibold">Closing Balance</p>
          {userClosingBalance?.length ? (
            <Table className="border text-sm">
              <TableHeader className="bg-primaryBG text-white text-xs">
                <TableRow>
                  {[
                    "Cash (AED)",
                    "Fixed Income (AED)",
                    "Equity (AED)",
                    "Real Estate (AED)",
                  ].map((col, index) => (
                    <TableHead
                      key={index}
                      className="text-white font-bold border"
                    >
                      {col}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody className="text-xs">
                {userClosingBalance.map(
                  (item: AggregatedClosingBalanceProps, index: number) => (
                    <TableRow key={index}>
                      <TableCell className="border">
                        {item.cash.toLocaleString() ?? "-"}
                      </TableCell>
                      <TableCell className="border">
                        {item.fixedIncome.toLocaleString() ?? "-"}
                      </TableCell>
                      <TableCell className="border">
                        {item.equity.toLocaleString() ?? "-"}
                      </TableCell>
                      <TableCell className="border">
                        {item.realEstate.toLocaleString() ?? "-"}
                      </TableCell>
                    </TableRow>
                  )
                )}
              </TableBody>
            </Table>
          ) : (
            <div className="my-5 text-center text-gray-500">
              No Data to show
            </div>
          )}

          <p className="my-5 text-lg font-semibold">Total Portfolio</p>
          {userTotalPortfolio?.length ? (
            <Table className="border text-sm">
              <TableHeader className="bg-primaryBG text-white text-xs">
                <TableRow>
                  {[
                    "Category",
                    "Sub Category",
                    "Asset Name",
                    "Market Value (AED)",
                    "Cost Price (AED)",
                    "Initial Cost (AED)",
                    "Unrealized Gain/Loss (AED)",
                    "Total Profit (AED)",
                  ].map((col, index) => (
                    <TableHead
                      key={index}
                      className="text-white font-bold border"
                    >
                      {col}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody className="text-xs">
                {userTotalPortfolio
                  .sort((a, b) => a.category.localeCompare(b.category))
                  .map((item, index) => (
                    <TableRow key={index}>
                      <TableCell className="border">{item.category}</TableCell>
                      <TableCell className="border">
                        {item.subCategory}
                      </TableCell>
                      <TableCell className="border">{item.userAsset}</TableCell>
                      <TableCell className="border">
                        {item.marketValue.toLocaleString()}
                      </TableCell>
                      <TableCell className="border">
                        {item.costPrice.toLocaleString()}
                      </TableCell>
                      <TableCell className="border">
                        {item.initialCost.toLocaleString()}
                      </TableCell>

                      <TableCell className="border">
                        {item.marketValue
                          ? (item.marketValue - item.costPrice).toLocaleString()
                          : "-"}
                      </TableCell>
                      <TableCell className="border">
                        {item.costPrice
                          ? (item.costPrice - item.initialCost).toLocaleString()
                          : "-"}
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          ) : (
            <div className="my-5 text-center">No Data to show</div>
          )}
        </div>
      )}

      <div className="flex flex-wrap gap-4 mb-5 mt-10">
        <div
          className="bg-gray-200 text-gray-700 text-sm px-3 py-1 rounded-md cursor-pointer"
          onClick={() => setCategory("all")}
        >
          View All
        </div>
        {categories.map((category: any, index: number) => (
          <div
            key={index}
            className="bg-gray-200 text-gray-700 text-sm px-3 py-1 rounded-md cursor-pointer"
            onClick={() => setCategory(category.name)}
          >
            {category.name}
          </div>
        ))}
      </div>
      <div className="flex justify-between items-center mb-10">
        <p className="text-2xl mb-1">New Investment Opportunities</p>

        <Link
          href={"/dashboard/investments"}
          className="text-sm hover:underline"
        >
          View All
        </Link>
      </div>
      {loading ? (
        <p className="text-center text-gray-500">Loading...</p>
      ) : error ? (
        <p className="text-center text-red-500">{error}</p>
      ) : investments.length === 0 ? (
        <p className="text-center text-gray-500">No investments available</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.isArray(filteredInvestments) &&
            filteredInvestments.map(
              (investment: InvestmentProps, index: number) => (
                <InvestmentCard
                  key={index}
                  investment={investment}
                  handleDelete={handleDelete}
                  role={role || "User"}
                />
              )
            )}
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
