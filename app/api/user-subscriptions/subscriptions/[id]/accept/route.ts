import { connectToDatabase } from "@/lib/db";
import Subscription from "@/models/Subscription";
import { sendErrorResponse, sendSuccessResponse } from "@/utils/apiResponse";

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();

    const updatedSubscription = await Subscription.findByIdAndUpdate(
      params.id,
      {
        status: "In Progress",
      },
      { new: true }
    );

    if (!updatedSubscription) {
      return sendErrorResponse(404, "Subscription not found");
    }

    return sendSuccessResponse(
      200,
      "Subscription accepted successfully",
      updatedSubscription
    );
  } catch (error) {
    return sendErrorResponse(500, "Internal server error", error);
  }
}
