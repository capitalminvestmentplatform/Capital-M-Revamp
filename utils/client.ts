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
  // ... other claims if needed
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
