import { render } from "@react-email/render";
import React from "react";

import VerifyUser from "@/templates/VerifyUser"; // Import email template
import Welcome from "@/templates/Welcome";
import Investment from "@/templates/Investment";
import CommitmentUser from "./CommitmentUser";
import CommitmentAdmin from "./CommitmentAdmin";
import SubscriptionSendToClient from "./SubscriptionSendToClient";
import CapitalCallSendToClient from "./CapitalCallSendToClient";
import ReceiptSendToClient from "./ReceiptSendToClient";
import CallRequestAdmin from "./CallRequestAdmin";
import SignedSubscriptionSendToClient from "./SignedSubscriptionSendToClient";

export async function receiptSendToClientEmail(
  payload: {
    username: string;
    email: string;
    title: string;
    receiptId: string;
    commitmentAmount: number;
    createdAt: Date;
    id: string;
    attachment: {
      file: string;
      name: string;
    };
  },
  subject: string
) {
  const {
    username,
    email,
    title,
    receiptId,
    commitmentAmount,
    createdAt,
    id,
    attachment,
  } = payload;
  const receiptUrl = `http://localhost:3000/dashboard/user-subscriptions/receipts/${id}`;

  const emailHtml = await render(
    React.createElement(ReceiptSendToClient, {
      username,
      title,
      receiptUrl,
      commitmentAmount,
      receiptId,
      createdAt,
    })
  );

  return sendEmail(email, subject, emailHtml, attachment);
}

export async function capitalCallSendToClientEmail(
  payload: {
    username: string;
    email: string;
    title: string;
    capitalCallId: string;
    commitmentAmount: number;
    bankName: string;
    accountName: string;
    IBAN: string;
    accountNumber: string;
    swiftCode: string;
    branch: string;
    attachment: {
      file: string;
      name: string;
    };
  },
  subject: string
) {
  const {
    username,
    email,
    title,
    capitalCallId,
    commitmentAmount,
    bankName,
    accountName,
    IBAN,
    accountNumber,
    swiftCode,
    branch,
    attachment,
  } = payload;
  const capitalCallUrl = `http://localhost:3000/dashboard/user-subscriptions/capital-calls/${capitalCallId}`;

  const emailHtml = await render(
    React.createElement(CapitalCallSendToClient, {
      username,
      title,
      capitalCallUrl,
      commitmentAmount,
      bankName,
      accountName,
      IBAN,
      accountNumber,
      swiftCode,
      branch,
    })
  );

  return sendEmail(email, subject, emailHtml, attachment);
}

export async function subscriptionSendToClientEmail(
  payload: {
    username: string;
    email: string;
    title: string;
    productId: string;
    subscriptionId: string;
  },
  subject: string
) {
  const { username, email, title, productId, subscriptionId } = payload;
  const subscriptionUrl = `http://localhost:3000/dashboard/user-subscriptions/subscriptions/${subscriptionId}`;

  const emailHtml = await render(
    React.createElement(SubscriptionSendToClient, {
      username,
      title,
      productId,
      subscriptionUrl,
    })
  );

  return sendEmail(email, subject, emailHtml);
}

export async function signedSubscriptionSendToClientEmail(
  payload: {
    username: string;
    email: string;
    title: string;
    subscriptionId: string;
    attachment: {
      file: string;
      name: string;
    };
  },
  subject: string
) {
  const { username, email, title, attachment, subscriptionId } = payload;
  const subscriptionUrl = `http://localhost:3000/dashboard/user-subscriptions/subscriptions/${subscriptionId}`;

  const emailHtml = await render(
    React.createElement(SignedSubscriptionSendToClient, {
      username,
      title,
      subscriptionUrl,
    })
  );

  return sendEmail(email, subject, emailHtml, attachment);
}

export async function commitmentUserEmail(
  payload: {
    firstName: string;
    lastName: string;
    email: string;
    title: string;
    phone: number;
    commitmentAmount: number;
    productId: string;
  },
  subject: string
) {
  const {
    firstName,
    lastName,
    email,
    title,
    phone,
    commitmentAmount,
    productId,
  } = payload;
  const emailHtml = await render(
    React.createElement(CommitmentUser, {
      name: `${firstName} ${lastName}`,
      title,
      phone,
      commitmentAmount,
      productId,
    })
  );

  return sendEmail(email, subject, emailHtml);
}

export async function callRequestAdminEmail(
  payload: {
    username: string;
    userEmail: string;
    adminEmail: string;
    title: string;
    phone: number;
    message: string;
    clientCode: string;
  },
  subject: string
) {
  const { username, userEmail, adminEmail, title, phone, message, clientCode } =
    payload;
  const emailHtml = await render(
    React.createElement(CallRequestAdmin, {
      username,
      userEmail,
      title,
      phone,
      message,
      clientCode,
    })
  );

  return sendEmail(adminEmail, subject, emailHtml);
}

export async function commitmentAdminEmail(
  payload: {
    username: string;
    userEmail: string;
    adminEmail: string;
    clientCode: string;
    title: string;
    phone: number;
    commitmentAmount: number;
    message: string;
  },
  subject: string
) {
  const {
    username,
    userEmail,
    adminEmail,
    title,
    phone,
    commitmentAmount,
    clientCode,
    message,
  } = payload;
  const emailHtml = await render(
    React.createElement(CommitmentAdmin, {
      username,
      userEmail,
      title,
      phone,
      commitmentAmount,
      message,
      clientCode,
    })
  );

  return sendEmail(adminEmail, subject, emailHtml);
}

export async function accountVerificationEmail(
  payload: {
    firstName: string;
    lastName: string;
    email: string;
    verificationToken: string;
  },
  subject: string
) {
  const { firstName, lastName, email, verificationToken } = payload;
  const verificationUrl = `http://localhost:3000/auth/verify-user?token=${verificationToken}`;
  const emailHtml = await render(
    React.createElement(VerifyUser, {
      name: `${firstName} ${lastName}`,
      verifyUrl: verificationUrl,
    })
  );

  return sendEmail(email, subject, emailHtml);
}

export async function newInvestmentEmail(
  payload: {
    firstName: string;
    lastName: string;
    email: string;
    title: string;
    projectedReturn: string;
    investmentDuration: string;
    investmentId: string;
  },
  subject: string
) {
  const {
    firstName,
    lastName,
    email,
    title,
    projectedReturn,
    investmentDuration,
    investmentId,
  } = payload;

  const investmentUrl = `http://localhost:3000/dashboard/investments/${investmentId}`;
  const emailHtml = await render(
    React.createElement(Investment, {
      name: `${firstName} ${lastName}`,
      title,
      projectedReturn: +projectedReturn,
      investmentDuration: +investmentDuration,
      investmentUrl,
    })
  );

  return sendEmail(email, subject, emailHtml);
}

export async function forgotPasswordEmail(
  payload: {
    firstName: string;
    lastName: string;
    email: string;
    resetToken: string;
  },
  subject: string
) {
  const { firstName, lastName, email, resetToken } = payload;
  const resetUrl = `http://localhost:3000/auth/verify-reset-pin?token=${resetToken}`;
  const emailHtml = await render(
    React.createElement(VerifyUser, {
      name: `${firstName} ${lastName}`,
      verifyUrl: resetUrl,
    })
  );

  return sendEmail(email, subject, emailHtml);
}

export async function welcomeEmail(
  payload: {
    firstName: string;
    lastName: string;
    email: string;
  },
  subject: string
) {
  const { firstName, lastName, email } = payload;
  const loginUrl = `http://localhost:3000/auth/login`;
  const emailHtml = await render(
    React.createElement(Welcome, { name: `${firstName} ${lastName}`, loginUrl })
  );

  return sendEmail(email, subject, emailHtml);
}

async function sendEmail(
  to: string,
  subject: string,
  content: string,
  attachment?: {
    file: string;
    name: string;
  }
) {
  try {
    const directUrl = `${attachment?.file}${attachment?.file.includes("?") ? "&" : "?"}alt=media`;

    const pdf = directUrl;
    const pdfName = attachment?.name;
    const response = await fetch(`http://localhost:3000/api/brevo`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ to, subject, content, pdf, pdfName }),
    });

    if (!response.ok) {
      console.error("Failed to send email", response);
    }
  } catch (error) {
    console.error("Email API Error:", error);
  }
}
