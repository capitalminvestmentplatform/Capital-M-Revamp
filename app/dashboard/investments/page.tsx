"use client";
import React, { useState, useEffect } from "react";
import InvestmentCard from "../../components/investments/InvestmentCard";
import { InvestmentProps } from "@/types/investments";
import { toast } from "sonner";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Grid, List } from "lucide-react";
import { getLoggedInUser } from "@/utils/client";
import DataTable from "../../components/investments/DataTable";

const InvestmentsPage = () => {
  const role = getLoggedInUser()?.role;
  const pathname = usePathname(); // Get the current path

  const [investments, setInvestments] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [category, setCategory] = useState("all");
  const [view, setView] = useState("grid");

  useEffect(() => {
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
      return true;
    } catch (error) {
      setError((error as Error).message);
      return false;
    }
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

  const tableCols =
    role === "Admin"
      ? [
          "Investment ID",
          "Title",
          "Category",
          "Expected Profit",
          "Investment Duration",
          "Status",
          "Actions", // Only include Actions column for Admin
        ]
      : [
          "Investment ID",
          "Title",
          "Category",
          "Expected Profit",
          "Investment Duration",
          "Status",
        ];

  return (
    <div className="container mx-auto max-w-[1440px] px-4">
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

      <div className="my-10 flex justify-between items-center">
        <div className="flex gap-4">
          <div
            className={`bg-gray-200 rounded-md p-2 cursor-pointer ${view === "grid" ? "bg-primaryBG text-white" : "initial"}`}
            onClick={() => setView("grid")}
          >
            <Grid size={20} />
          </div>
          <div
            className={`bg-gray-200 rounded-md p-2 cursor-pointer ${view === "list" ? "bg-primaryBG text-white" : "initial"}`}
            onClick={() => setView("list")}
          >
            <List size={20} />
          </div>
        </div>
        {role === "Admin" && (
          <Link
            href={`${pathname}/add`}
            className="bg-primaryBG hover:bg-primaryBG text-white text-sm px-5 py-2 rounded-md me-20"
          >
            Add new investment
          </Link>
        )}
      </div>

      {loading ? (
        <p className="text-center text-gray-500">Loading...</p>
      ) : error ? (
        <p className="text-center text-red-500">{error}</p>
      ) : investments.length === 0 ? (
        <p className="text-center text-gray-500">No investments available</p>
      ) : (
        <>
          {view === "grid" ? (
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
          ) : (
            <DataTable
              tableCols={tableCols}
              tableRows={filteredInvestments || []}
              handleDelete={handleDelete}
            />
          )}
        </>
      )}
    </div>
  );
};

export default InvestmentsPage;
