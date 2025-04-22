import { cookies } from "next/headers";
import Notification from "@/models/Notification";
import { connectToDatabase } from "@/lib/db";
import User from "@/models/User";
import { sendErrorResponse, sendSuccessResponse } from "@/utils/apiResponse";

export async function GET() {
  try {
    await connectToDatabase();

    const userId = (await cookies()).get("userId")?.value;

    if (!userId) {
      return sendErrorResponse(400, "User ID is required");
    }

    // Fetch user to get their email (since notifications use email in 'to' field)
    const user = (await User.findById(userId).lean()) as {
      email: string;
    } | null;
    if (!user) {
      return sendErrorResponse(404, "User not found");
    }

    // Fetch notifications addressed to the user's email
    const notifications = await Notification.find({ to: user.email })
      .sort({ createdAt: -1 })
      .lean();

    return sendSuccessResponse(
      200,
      "notifications fetched successfully",
      notifications
    );
  } catch (error) {
    return sendErrorResponse(500, "Internal server error", error);
  }
}

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const { to, title, message, type } = await req.json();

    const newNotification = new Notification({
      to,
      title,
      message,
      type,
      read: false,
    });
    await newNotification.save();

    return sendSuccessResponse(201, "Notification sent successfully");
  } catch (error) {
    return sendErrorResponse(500, "Internal server error", error);
  }
}
