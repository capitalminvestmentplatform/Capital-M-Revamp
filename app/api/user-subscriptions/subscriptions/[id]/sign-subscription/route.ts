import { connectToDatabase } from "@/lib/db";
import { uploadFileToCloudinary } from "@/lib/upload";
import Subscription from "@/models/Subscription";
import User from "@/models/User";
import { signedSubscriptionSendToClientEmail } from "@/templates/emails";
import { sendErrorResponse, sendSuccessResponse } from "@/utils/apiResponse";
import { loggedIn, parseForm, sendNotification } from "@/utils/server";
import { NextRequest } from "next/server";

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();
    const decoded: any = await loggedIn();
    const { sign, username, title, signedSubscription } = await req.json();

    const updatedSubscription = await Subscription.findByIdAndUpdate(
      params.id,
      {
        sign,
        signedSubscription,
      },
      { new: true }
    );

    if (!updatedSubscription) {
      return sendErrorResponse(404, "Subscription not found");
    }

    const notify = {
      title: "Signed Subscription",
      message: `Subscription Signed by ${username} for ${title} - Capital M`,
      type: "info",
    };

    const users = await User.find({
      role: "Admin",
    });

    for (const user of users) {
      await sendNotification(user.email, notify);

      setTimeout(() => {
        (globalThis as any).io?.emit("new-notification", {
          ...notify,
          timestamp: new Date(),
        });
      }, 1000);
    }

    const date = new Date();
    const monthYear = date.toLocaleString("en-US", {
      month: "short",
      year: "numeric",
    }); // e.g., "Dec 2025"
    const subscriptionId = params.id;

    await signedSubscriptionSendToClientEmail(
      {
        username,
        email: decoded.email,
        title,
        subscriptionId,
        attachment: {
          file: signedSubscription,
          name: `Confirmation of subscription - ${monthYear}.pdf`,
        },
      },
      `Confirmation of subscription - Capital M`
    );

    return sendSuccessResponse(
      200,
      "Signatures added successfully",
      updatedSubscription
    );
  } catch (error) {
    return sendErrorResponse(500, "Internal server error", error);
  }
}
