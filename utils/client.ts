import {
  AggregatedClosingBalanceProps,
  PortfolioItemProps,
} from "@/types/pandaConnect";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";

// Define the shape of your token's payload
type TokenPayload = {
  id: string; // adjust according to your token structure
  role: string; // optional, adjust as needed
  email: string; // optional, adjust as needed
  portfolioId: number; // optional, adjust as needed
  name: string;
  // ... other claims if needed
};

export const convertImageUrlToBase64 = async (
  url: string
): Promise<string | null> => {
  try {
    const res = await fetch(url, { mode: "cors" });
    const blob = await res.blob();

    return await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error("Failed to convert image to base64:", error);
    return null;
  }
};

export const uploadFileToCloudinary = async (
  file: File,
  folder: string
): Promise<string | null> => {
  const url = `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/upload`;

  const formData = new FormData();
  formData.append("file", file);
  formData.append(
    "upload_preset",
    process.env.NEXT_PUBLIC_CLOUDINARY_PRESET || ""
  );
  formData.append("folder", folder);

  try {
    const response = await fetch(url, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Failed to upload image");
    }

    const data = await response.json();
    return data.secure_url;
  } catch (error) {
    console.error("Error uploading file:", error);
    return null;
  }
};

export const getLoggedInUser = (): TokenPayload | null => {
  const token = Cookies.get("token");

  if (token) {
    try {
      const decoded = jwtDecode<TokenPayload>(token);
      return decoded; // or decoded.email, depending on your requirement
    } catch (error) {
      console.error("Invalid token", error);

      return null;
    }
  }

  return null;
};

export const calculatePortfolioSums = (data: PortfolioItemProps[]) => {
  const toCamelCase = (str: string) =>
    str
      .replace(/\s(.)/g, (match) => match.toUpperCase())
      .replace(/\s/g, "")
      .replace(/^(.)/, (match) => match.toLowerCase());

  const aggregatedData: Record<string, AggregatedClosingBalanceProps> = {};

  for (const item of data) {
    const userKey = `${item.email}-${item.clientCode}`;
    const category = toCamelCase(item.category);

    if (!aggregatedData[userKey]) {
      aggregatedData[userKey] = {
        email: item.email,
        clientCode: item.clientCode,
        cash: 0,
        equity: 0,
        fixedIncome: 0,
        realEstate: 0,
      };
    }

    (aggregatedData[userKey] as any)[category] =
      (aggregatedData[userKey] as any)[category] + item.marketValue || 0;
  }

  return Object.values(aggregatedData);
};

export const fetchCategories = async () => {
  try {
    const response = await fetch("/api/categories");
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const data = await response.json();

    return data.data;
  } catch (error) {
    return (error as Error).message;
  }
};
