import { connectToDatabase } from "@/lib/db";
import Category from "@/models/Category";
import { sendErrorResponse, sendSuccessResponse } from "@/utils/apiResponse";

export async function GET() {
  try {
    await connectToDatabase();

    const categories = await Category.find().sort({ name: 1 }).lean();

    return sendSuccessResponse(
      200,
      "categories fetched successfully!",
      categories
    );
  } catch (error) {
    return sendErrorResponse(500, "Internal server error", error);
  }
}
