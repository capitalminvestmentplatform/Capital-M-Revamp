import { connectToDatabase } from "@/lib/db";
import Commitment from "@/models/Commitment";
import Product from "@/models/Product";
import User from "@/models/User";
import { commitmentAdminEmail, commitmentUserEmail } from "@/templates/emails";
import { sendErrorResponse, sendSuccessResponse } from "@/utils/apiResponse";
import { loggedIn, sendNotification } from "@/utils/server";

export async function GET() {
  try {
    await connectToDatabase();

    // Fetch all products and populate the category field (only 'name')
    const commitments = await Commitment.find()
      .populate({
        path: "userId",
        select: "firstName lastName clientCode email", // grab raw fields
      })
      .populate({
        path: "pId",
        select:
          "title subscriptionFee managementFee performanceFee featuredImage area state productId", // raw fields
      })
      .lean();

    // Post-process each commitment
    const formattedCommitments = commitments.map((c) => {
      const { userId, pId, ...rest } = c;

      return {
        ...rest,
        username: `${userId?.firstName || ""} ${userId?.lastName || ""}`.trim(),
        email: userId?.email || "",
        clientCode: userId?.clientCode || "",
        title: pId?.title || "",
        thumbnail: pId?.featuredImage || "",
        productId: pId?.productId || "",
        subscriptionFee: pId?.subscriptionFee || 0,
        managementFee: pId?.managementFee || 0,
        performanceFee: pId?.performanceFee || 0,
        address: `${pId?.area || ""}, ${pId?.state || ""}`.trim(),
      };
    });

    return sendSuccessResponse(
      200,
      "Commitments fetched successfully!",
      formattedCommitments
    );
  } catch (error) {
    return sendErrorResponse(500, "Internal server error", error);
  }
}

export async function POST(req: Request) {
  try {
    await connectToDatabase();

    const { pId, userId, phone, commitmentAmount, message } = await req.json();

    const decoded: any = await loggedIn();

    const product = await Product.findById(pId);
    const { title, productId, minInvestment } = product;

    if (commitmentAmount < minInvestment)
      return sendErrorResponse(
        400,
        "Commitment amount must be greater than minimum investment"
      );

    let user = null;

    if (decoded.role === "Admin") {
      user = await User.findById(userId);
    } else {
      user = await User.findById(decoded.id);
    }

    const { email, clientCode, firstName, lastName } = user;

    const commitment = new Commitment({
      pId,
      userId,
      phone,
      commitmentAmount,
      message,
    });

    await commitment.save();

    const notify = {
      title: "New Commitment",
      message: `New commitment is added for the product: ${title}${decoded.role === "Admin" ? "." : ` by ${firstName} ${lastName}.`}`,
      type: "info",
    };

    if (decoded.role === "Admin") {
      await sendNotification(email, notify);

      setTimeout(() => {
        (globalThis as any).io?.emit("new-notification", {
          ...notify,
          timestamp: new Date(),
        });
      }, 1000);

      await commitmentUserEmail(
        {
          firstName,
          lastName,
          email,
          title,
          phone,
          commitmentAmount,
          productId,
        },
        `Commitment received for ${title} - Capital M`
      );
    } else {
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

        const username = `${firstName} ${lastName}`;
        const userEmail = email;
        const { email: adminEmail } = user;

        await commitmentAdminEmail(
          {
            username,
            userEmail,
            adminEmail,
            clientCode,
            title,
            phone,
            commitmentAmount,
            message,
          },
          `Commitment received for ${title} - Capital M`
        );
      }
    }

    return sendSuccessResponse(
      201,
      "Commitment added successfully!",
      commitment
    );
  } catch (error) {
    return sendErrorResponse(500, "Internal server error", error);
  }
}
