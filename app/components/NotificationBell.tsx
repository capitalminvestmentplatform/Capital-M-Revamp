"use client";

import { useNotifications } from "@/hooks/useNotifications";
import { Bell, X } from "lucide-react";
import { useState } from "react";

export default function NotificationBell({ email }: { email: string }) {
  const [showDropdown, setShowDropdown] = useState(false);
  const { notifications, unreadCount, markAllRead, markOneRead } =
    useNotifications(email);

  function getRelativeTime(date: string | Date): string {
    const now = new Date();
    const created = new Date(date);
    const diffInMs = now.getTime() - created.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays < 1) return "Today";
    if (diffInDays === 1) return "1d";
    if (diffInDays < 30) return `${diffInDays}d`;

    const diffInMonths = Math.floor(diffInDays / 30);
    return `${diffInMonths}mo`;
  }

  return (
    <div className="relative">
      <Bell
        className="cursor-pointer"
        size={22}
        onClick={() => setShowDropdown((p) => !p)}
      />
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 text-[10px] bg-red-600 text-white rounded-full px-1.5 py-0.5 leading-none">
          {unreadCount}
        </span>
      )}
      {showDropdown && (
        <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto z-50 bg-white border border-gray-200 rounded shadow-lg p-3">
          {notifications.length === 0 ? (
            <p className="text-sm text-gray-500">No notifications</p>
          ) : (
            <>
              <div className="flex justify-between items-center mb-2">
                <p className="text-sm font-medium">Notifications</p>
                <div className="flex gap-3 text-xs text-blue-600">
                  <button onClick={markAllRead} className="hover:underline">
                    Mark all as read
                  </button>
                </div>
              </div>
              {notifications.map((notif) => (
                <div
                  key={notif._id}
                  onClick={() => markOneRead(notif._id)}
                  className={`relative group text-sm border-b py-2 pr-6 cursor-pointer hover:bg-gray-100 ${
                    notif.read ? "text-gray-500" : "text-gray-800 font-medium"
                  }`}
                >
                  <p>
                    {notif.title}{" "}
                    <span className="text-xs text-primaryBG font-semibold ml-2">
                      {getRelativeTime(notif.createdAt)}
                    </span>
                  </p>
                  <p className="text-xs">{notif.message}</p>
                </div>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}
