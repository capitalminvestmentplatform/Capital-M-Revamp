import { render } from "@react-email/render";
import React from "react";

import VerifyUser from "@/templates/VerifyUser"; // Import email template
import Welcome from "@/templates/Welcome";

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

async function sendEmail(to: string, subject: string, content: string) {
  try {
    const response = await fetch(`http://localhost:3000/api/brevo`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ to, subject, content }),
    });

    if (!response.ok) {
      console.error("Failed to send email", response);
    }
  } catch (error) {
    console.error("Email API Error:", error);
  }
}
