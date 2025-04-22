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

const DashboardPage: React.FC = () => {
  const { role } = getLoggedInUser() || { role: "" };

  const [userTotalPortfolio, setUserTotalPortfolio] = useState<
    PortfolioItemProps[]
  >([]);
  const [userClosingBalance, setUserClosingBalance] = useState<
    AggregatedClosingBalanceProps[]
  >([]);
  const [closingBalanceData, setClosingBalanceData] = useState<number[]>([]);
  const [marketValuesData, setMarketValuesData] = useState<number[]>([]);
  const [costPriceData, setCostPriceData] = useState<number[]>([]);

  useEffect(() => {
    if (role !== "Admin") getUserData();
  }, []);

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

  if (role !== "Admin") {
    return (
      <div className="p-6">
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
          <div className="my-5 text-center text-gray-500">No Data to show</div>
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
                    <TableCell className="border">{item.subCategory}</TableCell>
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
    );
  }

  return <p>Admin</p>;
};

export default DashboardPage;
