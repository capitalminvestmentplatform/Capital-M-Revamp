import { connectToDatabase } from "@/lib/db";
import CapitalCall from "@/models/CapitalCall";
import { sendErrorResponse, sendSuccessResponse } from "@/utils/apiResponse";
import { loggedIn } from "@/utils/server";

// Accepts capitalCallId from the route like: /api/products/[id]

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

    const capitalCall = await CapitalCall.findByIdAndDelete(params.id);

    if (!capitalCall) {
      return sendErrorResponse(404, "Capital Call not found");
    }

    return sendSuccessResponse(200, "Capital Call deleted successfully");
  } catch (error) {
    return sendErrorResponse(500, "Internal server error", error);
  }
}
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();

    const capitalCallId = params.id;

    const capitalCall = await CapitalCall.findById(capitalCallId)
      .populate({
        path: "pId",
        select: "productId title commitmentDeadline",
      })
      .populate({
        path: "userId",
        select: "firstName lastName clientCode email phone",
      })
      .populate({
        path: "commitmentId",
        select: "commitmentAmount",
      })
      .lean();

    if (!capitalCall || Array.isArray(capitalCall)) {
      return sendErrorResponse(404, "Capital Call not found");
    }

    const { userId, pId, commitmentId, ...rest } = capitalCall;

    const formattedCapitalCall = {
      ...rest,
      username: `${userId?.firstName || ""} ${userId?.lastName || ""}`.trim(),
      email: userId?.email || "",
      clientCode: userId?.clientCode || "",
      phone: userId?.phone || "",
      commitmentAmount: commitmentId?.commitmentAmount || 0,
      commitmentDeadline: commitmentId?.commitmentDeadline || 0,
      title: pId?.title || "",
      productId: pId?.productId || "",
    };

    return sendSuccessResponse(
      200,
      "Capital Call fetched successfully",
      formattedCapitalCall
    );
  } catch (error) {
    return sendErrorResponse(500, "Internal server error", error);
  }
}
