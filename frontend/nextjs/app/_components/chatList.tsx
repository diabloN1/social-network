"use client";

import { useState, useEffect } from "react";
import getChatData from "@/app/api/_messages/getChatData";

// API response interfaces
interface Conv {
  groupId: number;
  userId: number;
  image: string;
  fullName: string;
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
  onSelectChat: (chat: Chat) => void;
}

export default function ChatList({ activeChat, onSelectChat }: ChatListProps) {
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

        console.log(data);

        const transformedChats: Chat[] = [
          // Transform group conversations
          ...data.groupConvs.map((group: Conv) => ({
            id: `group_${group.groupId}`,
            name: group.fullName,
            avatar: group.image || "/icons/placeholder.svg",
            lastMessage: "No messages yet",
            lastMessageTime: group.lastmessagedate || "No activity",
            unreadCount: 0,
            isGroup: true,
          })),

          // Transform private conversations
          ...data.privateConvs.map((priv: Conv) => ({
            id: `user_${priv.userId}`,
            name: priv.fullName,
            avatar: priv.image || "/icons/placeholder.svg",
            lastMessage: "No messages yet",
            lastMessageTime: priv.lastmessagedate || "No activity",
            unreadCount: 0,
            isOnline: false, // We don't have online status for now
          })),

          // Transform new conversations
          ...data.newConvs.map((newConv: Conv) => ({
            id: `user_${newConv.userId}`,
            name: newConv.fullName,
            avatar: newConv.image || "/icons/placeholder.svg",
            lastMessage: "New conversation",
            lastMessageTime: newConv.lastmessagedate || "No activity",
            unreadCount: 1, // Mark new conversations with an unread count
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

  // Filter chats based on search term and active tab
  const filteredChats = chats.filter((chat) => {
    const matchesSearch = chat.name
      .toLowerCase()
      .includes(filter.toLowerCase());

    if (activeTab === "+") return matchesSearch && chat.isNew; // No chats shown when "+" tab is active
    if (activeTab === "all") return matchesSearch && !chat.isNew;
    if (activeTab === "private")
      return matchesSearch && !chat.isGroup && !chat.isNew;
    if (activeTab === "groups") return matchesSearch && chat.isGroup;

    return matchesSearch;
  });

  // Handle new chat button click
  const handleNewChat = () => {
    setActiveTab("+");
    // Here you would implement the logic to create a new chat
    console.log("Create new chat");
  };

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
          onClick={handleNewChat}
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
                <img src={chat.avatar || "/placeholder.svg"} alt={chat.name} />
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
