import { connectToDatabase } from "@/lib/db";
import Commitment from "@/models/Commitment";
import { sendErrorResponse, sendSuccessResponse } from "@/utils/apiResponse";
import { loggedIn } from "@/utils/server";

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();

    const decoded: any = await loggedIn();
    if (!decoded || decoded.role !== "Admin") {
      return sendErrorResponse(403, "Unauthorized access");
    }

    const commitment = await Commitment.findById(params.id);

    if (!commitment) {
      return sendErrorResponse(404, "Commitment not found");
    }

    if (commitment.status !== "Pending") {
      return sendErrorResponse(400, "Only pending commitments can be deleted");
    }

    await Commitment.findByIdAndDelete(params.id);

    return sendSuccessResponse(200, "Commitment deleted successfully");
  } catch (error) {
    return sendErrorResponse(500, "Internal server error", error);
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();

    const decoded: any = await loggedIn();
    if (!decoded || decoded.role !== "Admin") {
      return sendErrorResponse(403, "Unauthorized access");
    }

    const body = await req.json();
    const { phone, commitmentAmount, message } = body;

    const updatedCommitment = await Commitment.findByIdAndUpdate(
      params.id,
      {
        phone,
        commitmentAmount: +commitmentAmount,
        message,
      },
      { new: true }
    );

    if (!updatedCommitment) {
      return sendErrorResponse(404, "Commitment not found");
    }

    return sendSuccessResponse(
      200,
      "Commitment updated successfully",
      updatedCommitment
    );
  } catch (error) {
    return sendErrorResponse(500, "Internal server error", error);
  }
}
