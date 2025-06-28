import User from "@/models/User";
import { connectToDatabase } from "@/lib/db";
import jwt from "jsonwebtoken";
import { accountVerificationEmail, welcomeEmail } from "@/templates/emails";
import { loggedIn, sendNotification } from "@/utils/server";
import { sendErrorResponse, sendSuccessResponse } from "@/utils/apiResponse";
import { NextRequest } from "next/server";
import { pusherServer } from "@/lib/pusher-server";

export async function getUsers() {
  try {
    await connectToDatabase();

    const users = await User.find({}, "-password"); // Exclude passwords from response
    return sendSuccessResponse(200, "Users fetched successfully", users);
  } catch (error) {
    return sendErrorResponse(500, "Internal server error", error);
  }
}

const getPandaConnectPortfolios = async () => {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}api/panda-connect/portfolio`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: "3114" }),
      }
    );

    const response = await res.json();
    if (!res.ok) {
      throw new Error(response.message || "Failed to fetch portfolios");
    }
    const portfolios = response.data;
    return portfolios;
  } catch (error) {
    console.error("Email API Error:", error);
  }
};

export async function createUser(req: NextRequest) {
  try {
    await connectToDatabase();
    const {
      firstName,
      lastName,
      username,
      phone,
      clientCode,
      email,
      password,
      confirmPassword,
      role,
    } = await req.json();

    const decoded: any = await loggedIn();

    // Check if the user is an admin
    if (decoded.role !== "Admin") {
      return sendErrorResponse(403, "Access denied");
    }

    // Validate PIN format (exactly 4 digits)
    if (!/^\d{4}$/.test(password)) {
      return sendErrorResponse(400, "Password must be a 4-digit PIN");
    }

    // Ensure password and confirmPassword match
    if (password !== confirmPassword) {
      return sendErrorResponse(400, "Passwords do not match");
    }
    // Check if the user already exists
    let existingUser = null;
    if (role === "Admin") {
      existingUser = await User.findOne({
        $or: [{ email }],
      });
    } else {
      existingUser = await User.findOne({
        $or: [{ email }, { clientCode }],
      });
    }

    if (existingUser) {
      return sendErrorResponse(409, "User already exists");
    }

    const portfolios = await getPandaConnectPortfolios();
    if (!portfolios) {
      return sendErrorResponse(500, "Failed to fetch portfolios");
    }
    const portfolio = portfolios.find((p: any) => p.name.includes(clientCode));

    // if (!portfolio) {
    //   return sendErrorResponse(
    //     404,
    //     "Portfolio against provided client code not found"
    //   );
    // }

    const jwtSecret = process.env.JWT_SECRET as string;
    const verificationToken = jwt.sign(
      { email, id: "userId", role: "User" },
      jwtSecret,
      {
        expiresIn: "24h",
      }
    );

    const newUser = new User({
      firstName,
      lastName,
      username,
      clientCode: clientCode ? clientCode : undefined,
      phone,
      email,
      password, // Store PIN as plain text (ensure database security measures)
      role,
      verificationToken,
      portfolioId: portfolio.portfolio_id ? portfolio.portfolio_id : undefined,
    });

    await newUser.save();

    await accountVerificationEmail(
      { firstName, lastName, email, verificationToken },
      "Verify Your Email - Capital M Investment Platform"
    );

    await welcomeEmail(
      { firstName, lastName, email },
      "Welcome to Capital M Investment Platform"
    );

    const admins = await User.find({
      role: "Admin",
      email: { $ne: decoded.email },
    });

    for (const admin of admins) {
      const notify = {
        title: "Say Hello to a New Member",
        message: `A new user ${firstName} ${lastName} has been registered.`,
        type: "info",
      };
      await sendNotification(admin.email, notify);

      await pusherServer.trigger(`user-${admin.email}`, "new-notification", {
        ...notify,
        timestamp: new Date(),
      });
    }

    return sendSuccessResponse(201, "User created successfully!", newUser);
  } catch (error) {
    return sendErrorResponse(500, "Internal server error", error);
  }
}
