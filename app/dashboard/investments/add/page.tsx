"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { fetchCategories } from "../../../../utils/client";
import { investmentSchema } from "../../../components/investments/InvestmentSchema";
import { InvestmentForm } from "../../../components/investments/InvestmentForm";

const AddInvestmentPage = () => {
  const form = useForm({
    resolver: zodResolver(investmentSchema(false)),
    defaultValues: {
      galleryImages: [],
      docs: [], // ✅ important
      faqs: [{ question: "", answer: "" }], // ✅ initial one row
      status: true,
    },
  });

  const router = useRouter();

  const [categories, setCategories] = useState<{ _id: string; name: string }[]>(
    []
  );
  const [loadingAction, setLoadingAction] = useState<
    "draft" | "publish" | null
  >(null);

  useEffect(() => {
    fetchCategoryList();
  }, []);

  const fetchCategoryList = async () => {
    const categories = await fetchCategories();

    setCategories(
      categories.map((category: { _id: string; name: string }) => ({
        _id: category._id,
        name: category.name,
      }))
    );
  };

  const onSubmit = async (data: any, isDraft: boolean = false) => {
    let formattedData = {
      ...data,
      expectedValue: +data.expectedValue,
      currentValue: +data.currentValue,
      projectedReturn: +data.projectedReturn,
      investmentDuration: +data.investmentDuration,
      minInvestment: +data.minInvestment,
      subscriptionFee: +data.subscriptionFee,
      managementFee: +data.managementFee,
      performanceFee: +data.performanceFee,
      isDraft,
      status: isDraft ? false : data.status, // ✅ Auto-set status = false if saving as draft
    };
    try {
      const formData = new FormData();
      if (isDraft) {
        setLoadingAction("draft");
      } else {
        setLoadingAction("publish");
      }

      // Append all scalar fields
      const scalarKeys = [
        "title",
        "tagline",
        "description",
        "investmentType",
        "expectedValue",
        "currentValue",
        "activationDate",
        "commitmentDeadline",
        "expirationDate",
        "projectedReturn",
        "investmentDuration",
        "minInvestment",
        "state",
        "area",
        "category",
        "subscriptionFee",
        "managementFee",
        "performanceFee",
        "terms",
        "status",
        "isDraft",
      ];

      scalarKeys.forEach((key) => {
        const value = formattedData[key];
        if (value !== undefined && value !== null) {
          formData.append(key, value);
        }
      });

      // Single files
      if (formattedData.featuredImage instanceof File) {
        formData.append("featuredImage", formattedData.featuredImage);
      }
      if (formattedData.video instanceof File) {
        formData.append("video", formattedData.video);
      }

      // Multiple files
      ["galleryImages", "docs"].forEach((key) => {
        const files = formattedData[key] as File[];
        if (Array.isArray(files)) {
          files.forEach((file) => {
            if (file instanceof File) {
              formData.append(key, file);
            }
          });
        }
      });

      // JSON field
      formData.append("faqs", JSON.stringify(formattedData.faqs));

      // 🚀 Submit
      const res = await fetch("/api/products", {
        method: "POST",
        body: formData,
      });

      const response = await res.json();

      if (response.statusCode !== 201) {
        toast.error(response.message);
        throw new Error(response.message);
      }

      toast.success(response.message);

      setTimeout(() => {
        router.push("/dashboard/investments");
      }, 2000);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <div>
      <div className="container mx-auto max-w-[1440px] px-4">
        <p className="text-xl font-semibold mb-5">Add New Investment</p>
        <InvestmentForm
          form={form}
          onSubmit={onSubmit}
          categories={categories}
          loadingAction={loadingAction} // ✅ pass here
          fetchCategories={fetchCategoryList} // ✅ added
        />
      </div>
    </div>
  );
};

export default AddInvestmentPage;
