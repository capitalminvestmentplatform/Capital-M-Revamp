import { connectToDatabase } from "@/lib/db";
import User from "@/models/User";
import { loggedIn } from "@/utils/server";
import { sendErrorResponse, sendSuccessResponse } from "@/utils/apiResponse";

export async function POST(req: Request) {
  try {
    await connectToDatabase();

    const decoded: any = await loggedIn();

    const { password, confirmPassword } = await req.json();

    if (!password || !confirmPassword) {
      return sendErrorResponse(400, "Passwords are required");
    }

    if (password !== confirmPassword) {
      return sendErrorResponse(400, "Passwords do not match");
    }

    // Ensure password is a 4-digit PIN
    if (!/^\d{4}$/.test(password)) {
      return sendErrorResponse(400, "Password must be a 4-digit PIN");
    }

    const user = await User.findOne({ email: decoded.email });
    if (!user) {
      return sendErrorResponse(404, "User not found");
    }

    // Set new PIN without hashing
    user.password = password;
    await user.save();

    return sendSuccessResponse(200, "PIN reset successfully");
  } catch (error) {
    return sendErrorResponse(500, "Internal server error", error);
  }
}
