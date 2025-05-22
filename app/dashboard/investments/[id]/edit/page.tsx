"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { fetchCategories } from "@/utils/client";
import { investmentSchema } from "../../../../components/investments/InvestmentSchema";
import { toast } from "sonner";
import { InvestmentForm } from "../../../../components/investments/InvestmentForm";

const EditInvestmentPage = () => {
  const { id } = useParams();
  const router = useRouter();

  const [loadingAction, setLoadingAction] = useState<
    "draft" | "publish" | null
  >(null);
  const [categories, setCategories] = useState<{ _id: string; name: string }[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mediaPreview, setMediaPreview] = useState({
    featuredImage: "",
    video: "",
    galleryImages: [] as string[],
    docs: [] as string[],
  });

  const form = useForm({
    resolver: zodResolver(investmentSchema(!!id)),
    defaultValues: {
      galleryImages: [],
      docs: [],
      faqs: [{ question: "", answer: "" }],
      status: true,
    },
  });

  useEffect(() => {
    fetchInitialData();
    fetchCategoryList();
  }, [id]);

  const formatDate = (date: string) =>
    new Date(date).toISOString().split("T")[0];

  const fetchInitialData = async () => {
    try {
      const response = await fetch(`/api/products/${id}`);

      const result = await response.json();

      if (result.statusCode !== 200) {
        toast.error(result.message || "Failed to fetch investment");
        throw new Error(result.message || "Failed to fetch investment");
      }

      const product = result.data;

      setMediaPreview({
        featuredImage: product.featuredImage || "",
        galleryImages: product.galleryImages || [],
        video: product.video || "",
        docs: product.docs || [],
      });

      // Populate form
      form.reset({
        ...product,
        status: !!product.status,
        category: product.category || "",
        activationDate: formatDate(product.activationDate),
        commitmentDeadline: formatDate(product.commitmentDeadline),
        expirationDate: formatDate(product.expirationDate),
        expectedValue: product.expectedValue.toString(),
        currentValue: product.currentValue.toString(),
        projectedReturn: product.projectedReturn.toString(),
        investmentDuration: product.investmentDuration.toString(),
        minInvestment: product.minInvestment.toString(),
        subscriptionFee: product.subscriptionFee.toString(),
        managementFee: product.managementFee.toString(),
        performanceFee: product.performanceFee.toString(),
        faqs:
          product.faqs.length > 0
            ? product.faqs
            : [{ question: "", answer: "" }],
        featuredImage: product.featuredImage ?? null,
        galleryImages: product.galleryImages ?? [],
        video: product.video ?? null,
        docs: product.docs ?? [],
      });

      setMediaPreview({
        featuredImage: product.featuredImage,
        video: product.video,
        galleryImages: product.galleryImages,
        docs: product.docs,
      });

      console.log("product", product);
    } catch (err: any) {
      toast.error("Failed to fetch investment data.");
      console.error(err);
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategoryList = async () => {
    const cats = await fetchCategories();
    setCategories(cats.map((cat: any) => ({ _id: cat._id, name: cat.name })));
  };

  const onSubmit = async (data: any, isDraft: boolean = false) => {
    const formattedData = {
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
      if (isDraft) {
        setLoadingAction("draft");
      } else {
        setLoadingAction("publish");
      }
      const formData = new FormData();

      for (const [key, value] of Object.entries(formattedData)) {
        if (key === "galleryImages" || key === "docs") {
          (value as File[]).forEach((file: File) => {
            if (file instanceof File) formData.append(key, file);
          });
        } else if (key === "video" || key === "featuredImage") {
          if (value && value instanceof File) {
            formData.append(key, value);
          }
        } else if (key === "faqs") {
          formData.append("faqs", JSON.stringify(value));
        } else {
          formData.append(key, value as any);
        }
      }
      for (const [key, value] of formData.entries()) {
        console.log(`${key}:`, value);
      }
      const res = await fetch(`/api/products/${id}`, {
        method: "PUT",
        body: formData,
      });

      const response = await res.json();

      if (!res.ok) throw new Error(response.message);

      toast.success("Investment updated successfully");

      // setTimeout(() => {
      //   router.push("/dashboard/investments");
      // }, 2000);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoadingAction(null);
    }
  };

  if (loading) return <p className="text-center text-gray-500">Loading...</p>;

  if (error) return <p className="text-center text-red-500">{error}</p>;

  return (
    <div className="container mx-auto max-w-[1440px] px-4">
      <p className="text-xl font-semibold mb-5">Edit Investment</p>

      <InvestmentForm
        form={form}
        onSubmit={onSubmit}
        categories={categories}
        loadingAction={loadingAction} // ✅ pass here
        mediaPreview={{
          featuredImage: mediaPreview?.featuredImage,
          galleryImages: mediaPreview?.galleryImages,
          video: mediaPreview?.video,
          docs: mediaPreview?.docs,
        }}
        fetchCategories={fetchCategoryList} // ✅ added
      />
    </div>
  );
};

export default EditInvestmentPage;
