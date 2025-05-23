"use client";

import { useState, useEffect } from "react";
import getChatData from "@/api/messages/getChatData";
import { onMessageType } from "@/helpers/webSocket";

// API response interfaces
interface Conv {
  groupId: number;
  userId: number;
  image: string;
  fullName: string;
  unreadcount: number;
  lastmessagedate: string;
}

// Chat interface for the component
export interface Chat {
  id: string; // as "user_" or "group_"
  name: string;
  avatar: string;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount: number;
  isGroup: boolean;
  isNew: boolean;
  isOnline?: boolean;
}

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

  useEffect(() => {
    const getChat = async () => {
      try {
        const data = await getChatData();
        if (data.error) {
          alert(data.error);
          return;
        }

        console.log("chats", data);

        const transformedChats: Chat[] = [
          // Transform group conversations
          ...data.groupConvs.map((group: Conv) => ({
            id: `group_${group.groupId}`,
            name: group.fullName,
            avatar: group.image || "/icons/placeholder.svg",
            lastMessage: "",
            lastMessageTime: group.lastmessagedate || "",
            unreadCount: group.unreadcount || 0,
            isGroup: true,
          })),

          // Transform private conversations
          ...data.privateConvs.map((priv: Conv) => ({
            id: `user_${priv.userId}`,
            name: priv.fullName,
            avatar: priv.image || "/icons/placeholder.svg",
            lastMessage: "",
            lastMessageTime: priv.lastmessagedate || "",
            unreadCount: priv.unreadcount || 0,
            isOnline: false, // We don't have online status for now
          })),

          // Transform new conversations
          ...data.newConvs.map((newConv: Conv) => ({
            id: `user_${newConv.userId}`,
            name: newConv.fullName,
            avatar: newConv.image || "/icons/placeholder.svg",
            lastMessage: "New conversation",
            lastMessageTime: newConv.lastmessagedate || "",
            unreadCount: 0,
            isNew: true,
            isOnline: false,
          })),
        ];

        setChats(transformedChats);
        setLoading(false);
      } catch (error) {
        alert("Error fetching chat data:" + error);
        setLoading(false);
      }
    };
    getChat();
  }, []);

  useEffect(() => {
    const unsubscribe = onMessageType("addMessage", (data: any) => {
      const currentChatId = activeChat?.id.split("_")[1];
      const isGroup = activeChat?.isGroup;

      const matchesCurrentChat = isGroup
        ? data.message.group_id === Number(currentChatId)
        : data.message.sender_id === Number(currentChatId) ||
          data.message.receiver_id === Number(currentChatId);

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
                <img
                  src={
                    chat.avatar
                      ? `http://localhost:8080/getProtectedImage?type=avatars&id=${
                          0
                        }&path=${encodeURIComponent(chat.avatar)}`
                      : "/icons/placeholder.svg"
                  }
                  alt="user avatar"
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
    </div>
  );
}
