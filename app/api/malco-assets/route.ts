import { NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/db";
import MalcoAsset from "@/models/MalcoAsset";
import { sendErrorResponse, sendSuccessResponse } from "@/utils/apiResponse";

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const subCategory = searchParams.get("subCategory");

    let malcoAssets: any = [];
    if (subCategory) {
      malcoAssets = await MalcoAsset.find({ subCategory })
        .sort({ name: 1 })
        .lean();
    } else {
      malcoAssets = await MalcoAsset.find().sort({ name: 1 }).lean();
    }

    return sendSuccessResponse(
      200,
      "Malco assets fetched successfully",
      malcoAssets
    );
  } catch (error) {
    return sendErrorResponse(500, "Internal server error", error);
  }
}
