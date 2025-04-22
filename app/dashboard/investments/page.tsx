"use client";
import React, { useState, useEffect } from "react";
import InvestmentCard from "./InvestmentCard";
import { InvestmentProps } from "@/types/investments";
import { fetchCategories } from "@/utils/client";
import { toast } from "sonner";

const InvestmentsPage = () => {
  const [investments, setInvestments] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchInvestments();
    const categoryList = async () => {
      const categoriesResponse = await fetchCategories();

      setCategories(categoriesResponse);
    };

    categoryList();
  }, []);

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

  console.log("investments", investments);

  if (loading) return <p className="text-center text-gray-500">Loading...</p>;
  return (
    <div>
      {investments.length === 0 ? (
        <p className="text-center text-gray-500">No investments available</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {investments.map((investment, index) => (
            <InvestmentCard key={index} investment={investment} />
          ))}
        </div>
      )}
    </div>
  );
};

export default InvestmentsPage;
