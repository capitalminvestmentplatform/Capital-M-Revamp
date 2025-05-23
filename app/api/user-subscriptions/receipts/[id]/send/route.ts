import { connectToDatabase } from "@/lib/db";
import Receipt from "@/models/Receipt";
import { receiptSendToClientEmail } from "@/templates/emails";
import { sendErrorResponse, sendSuccessResponse } from "@/utils/apiResponse";
import { loggedIn, sendNotification } from "@/utils/server";

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

    const {
      email,
      username,
      title,
      pdf,
      commitmentAmount,
      createdAt,
      receiptId,
    } = await req.json();

    const updatedReceipt = await Receipt.findByIdAndUpdate(
      params.id,
      {
        send: true,
        pdf,
        status: "In Progress",
      },
      { new: true }
    );

    if (!updatedReceipt) {
      return sendErrorResponse(404, "Receipt not found");
    }

    const notify = {
      title: "New Receipt",
      message: `New Receipt has been sent to you against product: ${title}`,
      type: "info",
    };

    await sendNotification(email, notify);

    setTimeout(() => {
      (globalThis as any).io?.emit("new-notification", {
        ...notify,
        timestamp: new Date(),
      });
    }, 1000);
    const id = params.id;

    const date = new Date();
    const monthYear = date.toLocaleString("en-US", {
      month: "short",
      year: "numeric",
    }); // e.g., "Dec 2025"

    await receiptSendToClientEmail(
      {
        username,
        email,
        title,
        receiptId,
        commitmentAmount,
        createdAt,
        id,
        attachment: {
          file: pdf,
          name: `Receipt - ${monthYear}`,
        },
      },
      `New Receipt has been sent to you - Capital M`
    );

    return sendSuccessResponse(
      200,
      "Sent to client successfully",
      updatedReceipt
    );
  } catch (error) {
    return sendErrorResponse(500, "Internal server error", error);
  }
}
