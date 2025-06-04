"use client";

import { useState, useEffect, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import "./Navbar.css";
import {
  connectWebSocket,
  onMessageType,
  closeWebSocket,
} from "@/helpers/webSocket";
import clearSessionCookie from "@/api/auth/clearSessionCookie";
import { useGlobalAPIHelper } from "@/helpers/GlobalAPIHelper";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("home");
  const [chatUnreadCount, setChatUnreadCount] = useState(0);
  const [joinRequestCount, setJoinRequestCount] = useState(0);
  const [followRequestCount, setFollowRequestCount] = useState(0);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { apiCall } = useGlobalAPIHelper();

  const fetchAllNotificationCounts = useCallback(async () => {
    const data = await apiCall(
      { type: "get-all-notifications" },
      "POST",
      "getAllNotifications"
    );
    console.log("iiiii",data);
    
    if (data && !data.error) {
      const notifications = data.notifications;

      setChatUnreadCount(notifications.messageUnread || 0);
      setJoinRequestCount(notifications.groupRequests || 0);
      setFollowRequestCount(notifications.followRequests || 0);
    }
  }, [apiCall]);

  // Updated handleLogout function for cookie-based sessions
  const handleLogout = async () => {
    if (isLoggingOut) return;

    setIsLoggingOut(true);

    try {
      closeWebSocket();

      await apiCall({ type: "logout" }, "POST", "logout");

      await clearSessionCookie();

      router.push("/auth");
      console.log("Logout successful");
    } catch (error) {
      console.error("Logout failed:", error);
      // Even if logout API fails, still try to clear the cookie
      try {
        await clearSessionCookie();
      } catch (cookieError) {
        //
        console.error("Failed to clear session cookie:", cookieError);
      }
    } finally {
      if (typeof window !== "undefined") {
        localStorage.clear();
      }

      setIsLoggingOut(false);
    }
  };

  useEffect(() => {
    fetchAllNotificationCounts();
  }, [fetchAllNotificationCounts]);

  useEffect(() => {
    if (pathname === "/app") {
      setActiveTab("home");
    } else if (pathname.includes("/app/profiles")) {
      setActiveTab("profile");
    } else if (pathname.includes("/app/groups")) {
      setActiveTab("groups");
    } else if (pathname.includes("/app/chat")) {
      setActiveTab("chat");
    }

    const notificationTypes = [
      "followRequestHandled",
      "joinRequestHandled",
      "unreadmsgRequestHandled",
    ];

    const notificationUnsubs = notificationTypes.map((type) =>
      onMessageType(type, fetchAllNotificationCounts)
    );

    const unsubscribe = onMessageType("addMessage", () => {
      fetchAllNotificationCounts();
    });

    const NotificationsWs = onMessageType("notifications", () => {
      console.log("recieved notif");
      
      fetchAllNotificationCounts();
    });

    return () => {
      unsubscribe();
      NotificationsWs();

      notificationUnsubs.forEach((unsub) => unsub());
    };
  }, [pathname, fetchAllNotificationCounts]);

  const navItems = [
    {
      id: "home",
      label: "Home",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="icon"
        >
          <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      ),
      link: "/app",
      notifications: 0,
    },
    {
      id: "chat",
      label: "chat",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="icon"
        >
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          <path d="M13 8H7" />
          <path d="M17 12H7" />
        </svg>
      ),
      link: "/app/chat",
      notifications: chatUnreadCount,
    },
    {
      id: "groups",
      label: "Groups",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="icon"
        >
          <rect width="8" height="6" x="5" y="4" rx="1" />
          <rect width="8" height="6" x="11" y="14" rx="1" />
        </svg>
      ),
      link: "/app/groups",
      notifications: joinRequestCount,
    },
    {
      id: "profile",
      label: "Profiles",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="icon"
        >
          <circle cx="12" cy="8" r="5" />
          <path d="M20 21a8 8 0 1 0-16 0" />
        </svg>
      ),
      link: "/app/profiles",
      notifications: followRequestCount,
    },
  ];

  useEffect(() => {
    connectWebSocket();
  }, []);

  return (
    <nav className="navbar">
      <ul className="nav-list">
        {navItems.map((item) => (
          <li
            key={item.id}
            className={`nav-item ${activeTab === item.id ? "active" : ""}`}
          >
            <Link
              href={item.link}
              className="nav-link"
              onClick={() => setActiveTab(item.id)}
              aria-label={item.label}
            >
              <div className="nav-item-content">
                {item.icon}
                <span className="label">{item.label}</span>
                {item.notifications > 0 && (
                  <span className="notification-badge">
                    {item.notifications}
                  </span>
                )}
              </div>
            </Link>
          </li>
        ))}

        {/* Logout Button */}
        <li className="nav-item logout-item">
          <button
            className="nav-link logout-button"
            onClick={handleLogout}
            disabled={isLoggingOut}
            aria-label="Logout"
          >
            <div className="nav-item-content">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="icon"
              >
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              <span className="label">
                {isLoggingOut ? "Logging out..." : "Logout"}
              </span>
            </div>
          </button>
        </li>
      </ul>
    </nav>
  );
}
