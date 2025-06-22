import { connectToDatabase } from "@/lib/db";
import Subscription from "@/models/Subscription";
import { subscriptionSendToClientEmail } from "@/templates/emails";
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

    const updatedSubscription = await Subscription.findByIdAndUpdate(
      params.id,
      {
        send: true,
      },
      { new: true }
    );

    if (!updatedSubscription) {
      return sendErrorResponse(404, "Subscription not found");
    }

    const { email, username, productId, title } = await req.json();

    const notify = {
      title: "You've Got a New Subscription",
      message: `New subscription is added for your signature against product: ${title}`,
      type: "info",
    };

    await sendNotification(email, notify);

    setTimeout(() => {
      (globalThis as any).io?.emit("new-notification", {
        ...notify,
        timestamp: new Date(),
      });
    }, 1000);
    const subscriptionId = params.id;
    await subscriptionSendToClientEmail(
      {
        username,
        email,
        title,
        productId,
        subscriptionId,
      },
      `New Subscription form has been added for your signatures - Capital M`
    );

    return sendSuccessResponse(
      200,
      "Sent to client successfully",
      updatedSubscription
    );
  } catch (error) {
    return sendErrorResponse(500, "Internal server error", error);
  }
}
