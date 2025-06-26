import { connectToDatabase } from "@/lib/db";
import Statement from "@/models/Statement";
import User from "@/models/User";
import { statementEmail } from "@/templates/emails";
import { sendErrorResponse, sendSuccessResponse } from "@/utils/apiResponse";
import { sendNotification } from "@/utils/server";
import { NextRequest } from "next/server";

export async function GET() {
  try {
    await connectToDatabase();

    // Fetch all products and populate the category field (only 'name')
    const statements = await Statement.find()
      .populate({
        path: "userId",
        select: "firstName lastName clientCode email", // grab raw fields
      })
      .lean();

    const formattedStatements = statements.map((c) => {
      const { userId, pId, ...rest } = c;

      return {
        ...rest,
        username: `${userId?.firstName || ""} ${userId?.lastName || ""}`.trim(),
        email: userId?.email || "",
        clientCode: userId?.clientCode || "",
      };
    });

    return sendSuccessResponse(
      200,
      "Statements fetched successfully!",
      formattedStatements
    );
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

    setTimeout(() => {
      (globalThis as any).io?.emit("new-notification", {
        ...notify,
        timestamp: new Date(),
      });
    }, 1000);

    const date = new Date();
    const formattedDate = date.toLocaleString("en-US", {
      month: "short", // "Jan", "Feb", etc.
      year: "numeric", // 2025
    }); // e.g., "Jun 2025"

    await statementEmail(
      {
        firstName,
        lastName,
        email,
        clientCode,
        month,
        year,
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
