import { connectToDatabase } from "@/lib/db";
import Commitment from "@/models/Commitment";
import { sendErrorResponse, sendSuccessResponse } from "@/utils/apiResponse";
import { loggedIn } from "@/utils/server";
import { NextRequest } from "next/server";

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();

    const decoded: any = await loggedIn();
    if (!decoded || decoded.role !== "Admin") {
      return sendErrorResponse(403, "Unauthorized access");
    }

    let updatedCommitment = await Commitment.findByIdAndUpdate(
      params.id,
      {
        status: "In Progress",
      },
      { new: true }
    );

    if (!updatedCommitment) {
      return sendErrorResponse(404, "Commitment not found");
    }

    return sendSuccessResponse(
      200,
      "Subscription initiated successfully",
      updatedCommitment
    );
  } catch (error) {
    return sendErrorResponse(500, "Internal server error", error);
  }
}
