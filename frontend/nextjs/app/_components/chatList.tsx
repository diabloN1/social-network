"use client"

import { useState } from "react"

interface User {
  id: number
  username: string
  firstname: string
  lastname: string
  nickname: string
  avatar?: string
  online: boolean
}

interface Chat {
  id: string
  name: string
  avatar: string
  lastMessage?: string
  lastMessageTime?: string
  unreadCount: number
  isGroup: boolean
  isOnline?: boolean
  members?: User[]
}

interface ChatListProps {
  chats: Chat[]
  activeChat: Chat | null
  onSelectChat: (chat: Chat) => void
  loading: boolean
}

export default function ChatList({ chats, activeChat, onSelectChat, loading }: ChatListProps) {
  const [filter, setFilter] = useState("")
  const [activeTab, setActiveTab] = useState<"all" | "private" | "groups">("all")

  // Filter chats based on search term and active tab
  const filteredChats = chats.filter((chat) => {
    const matchesSearch = chat.name.toLowerCase().includes(filter.toLowerCase())

    if (activeTab === "all") return matchesSearch
    if (activeTab === "private") return matchesSearch && !chat.isGroup
    if (activeTab === "groups") return matchesSearch && chat.isGroup

    return matchesSearch
  })

  if (loading) {
    return (
      <div className="chat-list">
        <div className="chat-list-header">
          <h2>Messages</h2>
        </div>
        <div className="loading-spinner">Loading...</div>
      </div>
    )
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
        <button className={`chat-tab ${activeTab === "all" ? "active" : ""}`} onClick={() => setActiveTab("all")}>
          All
        </button>
        <button
          className={`chat-tab ${activeTab === "private" ? "active" : ""}`}
          onClick={() => setActiveTab("private")}
        >
          Private
        </button>
        <button className={`chat-tab ${activeTab === "groups" ? "active" : ""}`} onClick={() => setActiveTab("groups")}>
          Groups
        </button>
      </div>

      <div className="chat-list-items">
        {filteredChats.length > 0 ? (
          filteredChats.map((chat) => (
            <div
              key={chat.id}
              className={`chat-item ${activeChat?.id === chat.id ? "active" : ""}`}
              onClick={() => onSelectChat(chat)}
            >
              <div className="chat-avatar">
                <img src={chat.avatar || "/placeholder.svg"} alt={chat.name} />
                {!chat.isGroup && chat.isOnline && <span className="online-indicator"></span>}
              </div>

              <div className="chat-item-content">
                <div className="chat-item-header">
                  <h3 className="chat-item-name">{chat.name}</h3>
                  <span className="chat-item-time">{chat.lastMessageTime}</span>
                </div>

                <div className="chat-item-message">
                  <p>{chat.lastMessage}</p>
                  {chat.unreadCount > 0 && <span className="unread-count">{chat.unreadCount}</span>}
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
  )
}
