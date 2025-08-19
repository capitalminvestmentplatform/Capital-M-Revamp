import { NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { loggedIn } from "@/utils/server";
import Statement from "@/models/Statement";
import { sendSuccessResponse, sendErrorResponse } from "@/utils/apiResponse";

const allowedSort = new Set(["createdAt", "month", "year"]);

/**
 * Month/Year search:
 *  - "Dec", "December"
 *  - "2022"
 *  - "Dec 2022" / "December 2022" (any order)
 *
 * IMPORTANT: When using $regexMatch we pass a PLAIN STRING + options (no RegExp with flags),
 * to avoid Mongo's "regex option(s) specified in both 'regex' and 'options'" error.
 */
function buildMonthYearSearch(search: string) {
  if (!search) return {};
  const s = search.trim();
  const tokens = s.split(/\s+/);

  const monthMap: Record<string, [string, string]> = {
    jan: ["Jan", "January"],
    feb: ["Feb", "February"],
    mar: ["Mar", "March"],
    apr: ["Apr", "April"],
    may: ["May", "May"],
    jun: ["Jun", "June"],
    jul: ["Jul", "July"],
    aug: ["Aug", "August"],
    sep: ["Sep", "September"],
    sept: ["Sep", "September"],
    oct: ["Oct", "October"],
    nov: ["Nov", "November"],
    dec: ["Dec", "December"],
    january: ["Jan", "January"],
    february: ["Feb", "February"],
    march: ["Mar", "March"],
    april: ["Apr", "April"],
    june: ["Jun", "June"],
    july: ["Jul", "July"],
    august: ["Aug", "August"],
    september: ["Sep", "September"],
    october: ["Oct", "October"],
    november: ["Nov", "November"],
    december: ["Dec", "December"],
  };

  let monthRegex: RegExp | null = null; // used directly on the 'month' field (fine)
  let yearNum: number | null = null; // prefer exact numeric match for year

  for (const t of tokens) {
    const k = t.toLowerCase();
    if (monthMap[k]) {
      const [abbr, full] = monthMap[k];
      monthRegex = new RegExp(`^(${abbr}|${full})$`, "i"); // match "Dec" OR "December"
    } else if (/^\d{4}$/.test(t)) {
      yearNum = Number(t);
    }
  }

  // Precise filtering when explicit tokens were found
  const and: any[] = [];
  if (monthRegex) and.push({ month: monthRegex });
  if (yearNum !== null) and.push({ year: yearNum });
  if (and.length) return { $and: and };

  // Fallback: generic contains on month or year-as-string
  const safe = s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return {
    $or: [
      { month: { $regex: safe, $options: "i" } },
      {
        $expr: {
          $regexMatch: {
            input: { $toString: "$year" },
            regex: safe, // <-- plain string (no flags here)
            options: "i", // <-- flags go here
          },
        },
      },
    ],
  };
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> } // keep Promise style
) {
  try {
    await connectToDatabase();

    const decoded: any = await loggedIn();
    const isAdmin = String(decoded?.role || "").toLowerCase() === "admin";

    const sp = req.nextUrl.searchParams;
    const page = Math.max(1, Number(sp.get("page") || 1));
    const limit = Math.max(1, Math.min(100, Number(sp.get("limit") || 10)));
    const search = (sp.get("search") || "").trim();

    const sortByParam = sp.get("sortBy") || "createdAt";
    const sortBy = (
      allowedSort.has(sortByParam) ? sortByParam : "createdAt"
    ) as "createdAt" | "month" | "year";
    const sortOrder: 1 | -1 = sp.get("sortOrder") === "asc" ? 1 : -1;

    const { userId } = await params;
    const myUserId = decoded?._id || decoded?.id;

    // Access control: client can only access themselves
    if (!isAdmin && String(userId) !== String(myUserId)) {
      return sendErrorResponse(403, "Forbidden");
    }

    const filter: any = { userId, ...buildMonthYearSearch(search) };

    const total = await Statement.countDocuments(filter);
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const safePage = Math.min(page, totalPages);
    const skip = (safePage - 1) * limit;

    const list = await Statement.find(filter)
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(limit)
      .populate({
        path: "userId",
        select: "firstName lastName clientCode email",
      })
      .lean();

    const items = list.map((doc: any) => {
      const { userId, ...rest } = doc;
      return {
        ...rest,
        username: `${userId?.firstName || ""} ${userId?.lastName || ""}`.trim(),
        email: userId?.email || "",
        clientCode: userId?.clientCode || "",
      };
    });

    return sendSuccessResponse(200, "User statements fetched!", {
      items,
      pagination: { total, page: safePage, limit, totalPages },
    });
  } catch (error) {
    return sendErrorResponse(500, "Internal server error", error);
  }
}
