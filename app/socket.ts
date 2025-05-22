"use client";

import { getLoggedInUser } from "@/utils/client";
import io from "socket.io-client";

export const socket = io({
  auth: {
    role: "Admin",
    email: getLoggedInUser()?.email ?? "default@example.com", // 👈 required
  },
});
