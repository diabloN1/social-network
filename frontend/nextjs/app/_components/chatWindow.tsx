"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Chat } from "./chatList"

interface User {
  id: number
  username: string
  firstname: string
  lastname: string
  nickname: string
  avatar?: string
  online: boolean
}

interface Message {
  id: number
  sender_id: number
  receiver_id?: number
  group_id?: number
  content: string
  created_at: string
  sender: User
}

interface ChatWindowProps {
  chat: Chat | null
  messages: Message[]
  onSendMessage: (content: string) => void
}

// Simple emoji list using Unicode characters
const EMOJI_LIST = ["😊", "😂", "❤️", "👍", "😍", "😒", "😘", "🙄", "😁", "👋"]

export default function ChatWindow({ chat, messages, onSendMessage }: ChatWindowProps) {
  const [messageInput, setMessageInput] = useState("")
  const [showEmojis, setShowEmojis] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messageInputRef = useRef<HTMLTextAreaElement>(null)

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Handle sending a message
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()

    if (!messageInput.trim()) return

    onSendMessage(messageInput)
    setMessageInput("")
    setShowEmojis(false)
  }

  // Add emoji to message input
  const addEmoji = (emoji: string) => {
    setMessageInput((prev) => prev + emoji)
    messageInputRef.current?.focus()
  }

  // Format timestamp
  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  // Format date for message groups
  const formatMessageDate = (timestamp: string) => {
    const date = new Date(timestamp)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) {
      return "Today"
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday"
    } else {
      return date.toLocaleDateString()
    }
  }

  // Group messages by date
  const groupMessagesByDate = () => {
    const groups: { date: string; messages: Message[] }[] = []

    messages.forEach((message) => {
      const messageDate = new Date(message.created_at).toDateString()
      const existingGroup = groups.find((group) => group.date === messageDate)

      if (existingGroup) {
        existingGroup.messages.push(message)
      } else {
        groups.push({
          date: messageDate,
          messages: [message],
        })
      }
    })

    return groups
  }

  if (!chat) {
    return (
      <div className="chat-window empty-state">
        <div className="empty-state-content">
          <h3>Select a conversation</h3>
          <p>Choose a chat from the list to start messaging</p>
        </div>
      </div>
    )
  }

  const messageGroups = groupMessagesByDate()

  return (
    <div className="chat-window">
      <div className="chat-header">
        <div className="chat-header-info">
          <div className="chat-avatar">
            <img src={chat.avatar || "/placeholder.svg"} alt={chat.name} />
            {!chat.isGroup && chat.isOnline && <span className="online-indicator"></span>}
          </div>
          <div className="chat-header-details">
            <h3>{chat.name}</h3>
            {!chat.isGroup && <span className="chat-status">{chat.isOnline ? "Online" : "Offline"}</span>}
          </div>
        </div>
      </div>

      <div className="chat-messages">
        {messageGroups.map((group, groupIndex) => (
          <div key={groupIndex} className="message-group">
            <div className="message-date">
              <span>{formatMessageDate(group.messages[0].created_at)}</span>
            </div>

            {group.messages.map((message, messageIndex) => {
              const isCurrentUser = message.sender_id === 0
              const showAvatar = messageIndex === 0 || group.messages[messageIndex - 1].sender_id !== message.sender_id

              return (
                <div key={message.id} className={`message ${isCurrentUser ? "outgoing" : "incoming"}`}>
                  {!isCurrentUser && showAvatar && (
                    <div className="message-avatar">
                      <img src={message.sender.avatar || "/placeholder.svg"} alt={message.sender.nickname} />
                    </div>
                  )}

                  <div className="message-content">
                    {!isCurrentUser && showAvatar && <div className="message-sender">{message.sender.nickname}</div>}
                    <div className="message-bubble">
                      <p>{message.content}</p>
                      <span className="message-time">{formatMessageTime(message.created_at)}</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ))}

        <div ref={messagesEndRef} />
      </div>

      <form className="chat-input" onSubmit={handleSendMessage}>
        <div className="emoji-container">
          <button 
            type="button" 
            className="emoji-toggle" 
            onClick={() => setShowEmojis(!showEmojis)}
          >
            &#128512;
          </button>
          
          {showEmojis && (
            <div className="emoji-list">
              {EMOJI_LIST.map((emoji, index) => (
                <button
                  key={index}
                  type="button"
                  className="emoji-btn"
                  onClick={() => addEmoji(emoji)}
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}
        </div>

        <textarea
          ref={messageInputRef}
          value={messageInput}
          onChange={(e) => setMessageInput(e.target.value)}
          placeholder="Type a message..."
          className="message-input"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault()
              handleSendMessage(e)
            }
          }}
        />

        <button type="submit" className="send-button" disabled={!messageInput.trim()}>
          &#10148;
        </button>
      </form>
    </div>
  )
}
