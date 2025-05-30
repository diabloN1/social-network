"use client";

import { useState, useEffect } from "react";
import getChatData from "@/api/messages/getChatData";
import { onMessageType } from "@/helpers/webSocket";
import Popup from "@/app/app/popup";
import { Chat, ResChat } from "@/types/chat";
import { AddMessageEvent } from "@/types/message";
import Image from "next/image";

interface ChatListProps {
  activeChat: Chat | null;
  setActiveChat: (chat: Chat) => void;
}

export default function ChatList({ activeChat, setActiveChat }: ChatListProps) {
  const [chats, setChats] = useState<Chat[]>([]);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    "+" | "all" | "private" | "groups"
  >("all");
  const [popup, setPopup] = useState<{
    message: string;
    status: "success" | "failure";
  } | null>(null);

  useEffect(() => {
    const getChat = async () => {
      try {
        const data = await getChatData();
        if (data.error) {
          setPopup({ message: data.error, status: "failure" });
          return;
        }
        if (data.privateConvs) {
          data.privateConvs.sort(
            (
              a: { lastmessagedate: string },
              b: { lastmessagedate: string }
            ) => {
              const dateA = a.lastmessagedate
                ? new Date(a.lastmessagedate)
                : new Date(0);
              const dateB = b.lastmessagedate
                ? new Date(b.lastmessagedate)
                : new Date(0);
              return dateB.getTime() - dateA.getTime();
            }
          );  
        }

        const transformedChats: Chat[] = [
          // Transform group conversations
          ...data.groupConvs.map((group: ResChat) => ({
            id: `group_${group.groupId}`,
            name: group.fullName,
            avatar: group.image || "/icons/placeholder.svg",
            lastMessage: "",
            lastMessageTime: group.lastmessagedate || "",
            unreadCount: group.unreadcount || 0,
            isGroup: true,
          })),

          // Transform private conversations
          ...data.privateConvs.map((priv: ResChat) => ({
            id: `user_${priv.userId}`,
            name: priv.fullName,
            avatar: priv.image || "/icons/placeholder.svg",
            lastMessage: "",
            lastMessageTime: priv.lastmessagedate || "",
            unreadCount: priv.unreadcount || 0,
            isGroup: false,
            isOnline: false, // We don't have online status for now
          })),

          // Transform new conversations
          ...data.newConvs.map((newConv: ResChat) => ({
            id: `user_${newConv.userId}`,
            name: newConv.fullName,
            avatar: newConv.image || "/icons/placeholder.svg",
            lastMessage: "New conversation",
            lastMessageTime: newConv.lastmessagedate || "",
            unreadCount: 0,
            isNew: true,
            isGroup: false,
            isOnline: false,
          })),
        ];

        setChats(transformedChats);
        setLoading(false);
      } catch (error) {
        setPopup({ message: `${error}`, status: "failure" });
        setLoading(false);
      }
    };
    getChat();
  }, []);

  useEffect(() => {
    const unsubscribe = onMessageType("addMessage", (data: AddMessageEvent) => {
      const currentChatId = activeChat?.id.split("_")[1];
      const isGroup = activeChat?.isGroup;

      const matchesCurrentChat = isGroup
        ? data.message.group_id === Number(currentChatId)
        : data.message.sender_id === Number(currentChatId) ||
          data.message.recipient_id === Number(currentChatId);

      // Only show notification if it's NOT the active chat
      if (!matchesCurrentChat) {
        setChats((prevChats) => {
          const updatedChats = [...prevChats];

          const index = updatedChats.findIndex(
            (chat) =>
              chat.id ===
              (data.message.group_id
                ? "group_" + data.message.group_id
                : "user_" + data.message.sender_id)
          );

          if (index === -1) return prevChats;

          const updatedChat = {
            ...updatedChats[index],
            unreadCount: updatedChats[index].unreadCount + 1,
            lastMessage: data.message.text,
            lastMessageTime: new Date().toISOString(),
          };

          updatedChats.splice(index, 1);
          return [updatedChat, ...updatedChats];
        });
      }
    });

    return () => {
      unsubscribe(); // Clean up listener when chat change or component unmounts
    };
  }, [activeChat]);

  const onSelectChat = (chat: Chat) => {
    setActiveChat(chat);

    setChats((prevChats) =>
      prevChats.map((c) =>
        c.id === chat.id
          ? { ...c, unreadCount: 0, lastMessage: "", lastMessageTime: "" }
          : c
      )
    );
  };

  // Filter chats based on search term and active tab
  const filteredChats = chats.filter((chat) => {
    const matchesSearch = chat.name
      .toLowerCase()
      .includes(filter.toLowerCase());

    if (activeTab === "+") return matchesSearch && chat.isNew;
    if (activeTab === "all") return matchesSearch && !chat.isNew;
    if (activeTab === "private")
      return matchesSearch && !chat.isGroup && !chat.isNew;
    if (activeTab === "groups") return matchesSearch && chat.isGroup;

    return matchesSearch;
  });

  if (loading) {
    return (
      <div className="chat-list">
        <div className="chat-list-header">
          <h2>Messages</h2>
        </div>
        <div className="loading-spinner">Loading...</div>
      </div>
    );
  }

  return (
    <div className="chat-list">
      <div className="chat-list-header">
        <h2>Messages</h2>
      </div>

      <div className="chat-search">
        <input
          type="text"
          placeholder="Search conversations..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="chat-search-input"
        />
      </div>

      <div className="chat-tabs">
        <button
          className={`chat-tab ${activeTab === "+" ? "active" : ""}`}
          onClick={() => setActiveTab("+")}
        >
          +
        </button>
        <button
          className={`chat-tab ${activeTab === "all" ? "active" : ""}`}
          onClick={() => setActiveTab("all")}
        >
          All
        </button>
        <button
          className={`chat-tab ${activeTab === "private" ? "active" : ""}`}
          onClick={() => setActiveTab("private")}
        >
          Private
        </button>
        <button
          className={`chat-tab ${activeTab === "groups" ? "active" : ""}`}
          onClick={() => setActiveTab("groups")}
        >
          Groups
        </button>
      </div>

      <div className="chat-list-items">
        {filteredChats.length > 0 ? (
          filteredChats.map((chat) => (
            <div
              key={chat.id}
              className={`chat-item ${
                activeChat?.id === chat.id ? "active" : ""
              }`}
              onClick={() => onSelectChat(chat)}
            >
              <div className="chat-avatar">
                <Image
                  src={
                    chat.avatar
                      ? `http://localhost:8080/getProtectedImage?type=avatars&id=0&path=${encodeURIComponent(
                          chat.avatar
                        )}`
                      : "/icons/placeholder.svg"
                  }
                  alt="user avatar"
                  width={40}
                  height={40}
                  unoptimized
                />
                {!chat.isGroup && chat.isOnline && (
                  <span className="online-indicator"></span>
                )}
              </div>

              <div className="chat-item-content">
                <div className="chat-item-header">
                  <h3 className="chat-item-name">{chat.name}</h3>
                  <span className="chat-item-time">{chat.lastMessageTime}</span>
                </div>

                <div className="chat-item-message">
                  <p>{chat.lastMessage}</p>
                  {chat.unreadCount > 0 && (
                    <span className="unread-count">{chat.unreadCount}</span>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="no-chats">
            <p>No conversations found</p>
          </div>
        )}
      </div>
      {popup && (
        <Popup
          message={popup.message}
          status={popup.status}
          onClose={() => setPopup(null)}
        />
      )}
    </div>
  );
}
