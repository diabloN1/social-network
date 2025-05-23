"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import "./Navbar.css";
import { connectWebSocket, onMessageType } from "@/helpers/webSocket";
import fetchJoinRequestCount from "@/api/groups/getcountrequestjoin";
import getUnreadChatCount from "@/api/messages/getUnreadMessagesCount";

export default function Navbar() {
  const pathname = usePathname();
  const [activeTab, setActiveTab] = useState("home");
  const [chatUnreadCount, setChatUnreadCount] = useState(0);
const [joinRequestCount, setJoinRequestCount] = useState(0);

useEffect(() => {
 
const getJoinRequestCount = async () => {
  console.log("dddddddddddddddd");
  
    const data = await fetchJoinRequestCount();
    if (data?.count != null) {
      setJoinRequestCount(data.count);
    }
  };

  getJoinRequestCount();


   const fetchUnreadCount = async () => {
    const data = await getUnreadChatCount();
    if (data?.count != null) {
      setChatUnreadCount(data.count);
    }
  };
  fetchUnreadCount();
}, []);

  useEffect(() => {
    if (pathname === "/app") {
      setActiveTab("home");
    } else if (pathname.includes("/app/profiles")) {
      setActiveTab("profile");
    } else if (pathname.includes("/app/groups")) {
      setActiveTab("groups");
    } else if (pathname.includes("/app/chat")) {
      setActiveTab("chat");
    } else if (pathname.includes("/app/notifications")) {
      setActiveTab("notification");
    }

     
  if (pathname.includes("/app/chat")) {
    setChatUnreadCount(0);
  }

if (pathname.includes("/app/groups")) {
  setJoinRequestCount(0);
}


  const unsubscribe = onMessageType("addMessage", () => {
    if (!pathname.includes("/app/chat")) {
      setChatUnreadCount((prev) => prev + 1);
    }
  });

const unsubscribeJoinRequest = onMessageType("newjoinrequest", () => {
  if (!pathname.includes("/app/groups")) {
    setJoinRequestCount((prev) => prev + 1);
  }
});

  return () => {
    unsubscribe();
     unsubscribeJoinRequest();
  };
  }, [pathname]);

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
      notifications: 0,
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
      </ul>
    </nav>
  );
}
