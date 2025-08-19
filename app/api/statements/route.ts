import { connectToDatabase } from "@/lib/db";
import { pusherServer } from "@/lib/pusher-server";
import Statement from "@/models/Statement";
import User from "@/models/User";
import { statementEmail } from "@/templates/emails";
import { sendErrorResponse, sendSuccessResponse } from "@/utils/apiResponse";
import { loggedIn, sendNotification } from "@/utils/server";
import { NextRequest } from "next/server";

const allowedSort = new Set(["createdAt", "month", "year"]);

/**
 * Month/Year search supporting:
 * - "Dec", "December"
 * - "2022"
 * - "Dec 2022" / "December 2022" (any order)
 * - generic: partial month text or partial digits (falls back to regex on year string)
 *
 * IMPORTANT: When using $regexMatch we pass a **plain string** + options,
 * never a RegExp with flags (prevents the 405 error you saw).
 */
function buildMonthYearSearch(search: string) {
  if (!search) return {};

  const s = search.trim();
  const tokens = s.split(/\s+/);

  const m: Record<string, [string, string]> = {
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

  let monthRegex: RegExp | null = null; // used directly on 'month'
  let yearNum: number | null = null; // prefer exact match on numeric year

  for (const t of tokens) {
    const key = t.toLowerCase();
    if (m[key]) {
      const [abbr, full] = m[key];
      // exact month match (abbr OR full)
      monthRegex = new RegExp(`^(${abbr}|${full})$`, "i");
    } else if (/^\d{4}$/.test(t)) {
      yearNum = Number(t);
    }
  }

  // If we found explicit tokens, build precise filters
  const and: any[] = [];
  if (monthRegex) and.push({ month: monthRegex });
  if (yearNum !== null) and.push({ year: yearNum });
  if (and.length) return { $and: and };

  // Otherwise fall back to a generic contains search on month or year-as-string
  const safe = s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return {
    $or: [
      { month: { $regex: safe, $options: "i" } },
      {
        $expr: {
          $regexMatch: {
            input: { $toString: "$year" },
            regex: safe, // <-- plain string
            options: "i", // <-- flags live here (no flags on the regex value)
          },
        },
      },
    ],
  };
}

export async function GET(req: NextRequest) {
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

    // ────────────── ADMIN: grouped by user (now supports clientCode + month/year search + sort + pagination) ──────────────
    if (isAdmin) {
      const orFilters: any[] = [];

      // clientCode → userId(s)
      if (search) {
        const safe = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const matchedUsers = await User.find(
          { clientCode: { $regex: safe, $options: "i" } },
          { _id: 1 }
        ).lean();
        if (matchedUsers.length) {
          orFilters.push({ userId: { $in: matchedUsers.map((u) => u._id) } });
        }
      }

      // month/year filter on statements
      const monthYear = buildMonthYearSearch(search);
      if (Object.keys(monthYear).length) orFilters.push(monthYear);

      // If no search at all, match everything; otherwise OR across the two dimensions
      const match = orFilters.length ? { $or: orFilters } : {};

      // count distinct users after match
      const totalUsers = (await Statement.distinct("userId", match)).length;
      const totalPages = Math.max(1, Math.ceil(totalUsers / limit));
      const safePage = Math.min(page, totalPages);
      const skip = (safePage - 1) * limit;

      const finalSort =
        sortBy === "createdAt"
          ? { "latest.createdAt": sortOrder }
          : sortBy === "month"
            ? { "latest.month": sortOrder }
            : { "latest.year": sortOrder };

      const pipeline: any[] = [
        { $match: match },
        { $sort: { createdAt: -1 } }, // ensure $first is latest
        {
          $group: {
            _id: "$userId",
            latest: { $first: "$$ROOT" },
            statementsCount: { $sum: 1 },
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "_id",
            foreignField: "_id",
            as: "user",
          },
        },
        { $unwind: "$user" },
        {
          $project: {
            _id: 0,
            userId: "$_id",
            statementsCount: 1,
            latestStatementId: "$latest._id",
            latestMonth: "$latest.month",
            latestYear: "$latest.year",
            latestCreatedAt: "$latest.createdAt",
            latestPdf: "$latest.pdf",
            username: {
              $trim: {
                input: {
                  $concat: [
                    { $ifNull: ["$user.firstName", ""] },
                    " ",
                    { $ifNull: ["$user.lastName", ""] },
                  ],
                },
              },
            },
            email: "$user.email",
            clientCode: "$user.clientCode",
          },
        },
        { $sort: finalSort },
        { $skip: skip },
        { $limit: limit },
      ];

      const rows = await Statement.aggregate(pipeline).exec();
      return sendSuccessResponse(200, "Users with latest statements fetched!", {
        mode: "latest",
        items: rows,
        pagination: { total: totalUsers, page: safePage, limit, totalPages },
      });
    }

    // ────────────── CLIENT: own statements with full filters ──────────────
    const myUserId = decoded?._id || decoded?.id;
    if (!myUserId) return sendErrorResponse(401, "Unauthorized");

    const filter: any = { userId: myUserId, ...buildMonthYearSearch(search) };

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

    return sendSuccessResponse(200, "My statements fetched!", {
      mode: "user",
      items,
      pagination: { total, page: safePage, limit, totalPages },
    });
  } catch (error) {
    return sendErrorResponse(500, "Internal server error", error);
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();

    const { userId, month, year, pdf } = await req.json();

    let user = null;

    user = await User.findById(userId);

    // 🔒 Prevent duplicate statements
    const existingStatement = await Statement.findOne({ userId, month, year });
    if (existingStatement) {
      return sendErrorResponse(
        400,
        `Statement for ${month} ${year} already exists.`
      );
    }

    const { email, clientCode, firstName, lastName } = user;

    const statement = new Statement({
      userId,
      month,
      year,
      pdf,
    });

    await statement.save();

    const notify = {
      title: "You've Got a New Statement",
      message: `New statement is added for Month: ${month} ${year}`,
      type: "info",
    };

    await sendNotification(email, notify);

    await pusherServer.trigger(`user-${email}`, "new-notification", {
      ...notify,
      timestamp: new Date(),
    });

    const date = new Date();
    const formattedDate = date.toLocaleString("en-US", {
      month: "short", // "Jan", "Feb", etc.
      year: "numeric", // 2025
    }); // e.g., "Jun 2025"

    const id = statement.id;

    await statementEmail(
      {
        firstName,
        lastName,
        email,
        clientCode,
        month,
        year,
        id,
        attachment: {
          file: pdf,
          name: `Statement - ${formattedDate}.pdf`,
        },
      },
      `Statement - ${formattedDate} - Capital M`
    );

    return sendSuccessResponse(201, "Statement added successfully!", statement);
  } catch (error) {
    return sendErrorResponse(500, "Internal server error", error);
  }
}
