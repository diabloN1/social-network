"use client";

import type React from "react";
import { useState, useRef, useEffect } from "react";
import { Chat } from "./chatList";
import getMessages from "../api/messages/getMesages";
import { addMessage } from "../_ws/addMessage";
import { onMessageType, socket } from "../_ws/webSocket";
import getToken from "../api/auth/getToken";

interface User {
  id: number;
  username: string;
  firstname: string;
  lastname: string;
  nickname: string;
  avatar?: string;
  online: boolean;
}

interface Message {
  id: number;
  sender_id: number;
  receiver_id?: number;
  group_id?: number;
  text: string;
  created_at: string;
  isOwned: boolean;
  user: User;
}

interface ChatWindowProps {
  chat: Chat | null;
}

// Simple emoji list using Unicode characters
const EMOJI_LIST = ["😊", "😂", "❤️", "👍", "😍", "😒", "😘", "🙄", "😁", "👋"];

export default function ChatWindow({ chat }: ChatWindowProps) {
  const [messageInput, setMessageInput] = useState("");
  const [showEmojis, setShowEmojis] = useState(false);
  const [messages, setMessages] = useState<Message[] | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageInputRef = useRef<HTMLTextAreaElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    const initMessages = async () => {
      const id = Number(chat?.id.split("_")[1]);
      if (!id) return;
      try {
        const data = await getMessages(id, chat?.isGroup || false);
        if (data.error) {
          alert(data.error);
          return;
        }
        console.log("--------", data);

        setMessages(data?.messages);
      } catch (error) {
        alert(error);
      }
    };
    initMessages();

    const currentChatId = Number(chat?.id.split("_")[1]);
    const isGroup = chat?.isGroup;

    const unsubscribe = onMessageType("addMessage", async (data: any) => {
      const isMatch = isGroup
        ? data.message.group_id === currentChatId
        : data.message.sender_id === currentChatId ||
          data.message.recipient_id === currentChatId;

      data.message.isOwned = data.isOwned;

      if (isMatch) {
        try {
          setMessages((prev) =>
            prev != null ? [...prev, data.message] : [data.message]
          );

          socket?.send(
            JSON.stringify({
              type: "updateseenmessages",
              id: currentChatId,
              isGroup,
              session: (await getToken()).session,
            })
          );
        } catch (error) {
          alert(error);
        }
      }
    });

    return () => {
      unsubscribe(); // Clean up listener when chat change or component unmounts
    };
  }, [chat]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
    });
  }, [messages]);

  // Handle sending a message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim()) return;
    const id = Number(chat?.id.split("_")[1]);

    try {
      await addMessage(id, chat?.isGroup ?? false, messageInput);

      setMessageInput("");
      setShowEmojis(false);
    } catch (error) {
      alert(error);
    }
  };

  // Add emoji to message input
  const addEmoji = (emoji: string) => {
    setMessageInput(messageInput + emoji);
    messageInputRef.current?.focus();
  };

  // Group messages by date
  const groupMessagesByDate = () => {
    const groups: { date: string; messages: Message[] }[] = [];

    messages?.forEach((message) => {
      const messageDate = new Date(message.created_at).toDateString();
      const existingGroup = groups.find((group) => group.date === messageDate);

      if (existingGroup) {
        existingGroup.messages.push(message);
      } else {
        groups.push({
          date: messageDate,
          messages: [message],
        });
      }
    });

    return groups;
  };

  if (!chat) {
    return (
      <div className="chat-window empty-state">
        <div className="empty-state-content">
          <h3>Select a conversation</h3>
          <p>Choose a chat from the list to start messaging</p>
        </div>
      </div>
    );
  }

  const messageGroups = groupMessagesByDate();

  return (
    <div className="chat-window">
      <div className="chat-header">
        <div className="chat-header-info">
          <div className="chat-avatar">
            <img
              src={chat.avatar || "/icons/placeholder.svg"}
              alt={chat.name}
            />
            {!chat.isGroup && chat.isOnline && (
              <span className="online-indicator"></span>
            )}
          </div>
          <div className="chat-header-details">
            <h3>{chat.name}</h3>
            {!chat.isGroup && (
              <span className="chat-status">
                {chat.isOnline ? "Online" : "Offline"}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="chat-messages">
        {messageGroups.map((group, groupIndex) => (
          <div key={groupIndex} className="message-group">
            <div className="message-date">
              <span>{group.messages[0].created_at}</span>
            </div>

            {group.messages.map((message, messageIndex) => {
              const showAvatar =
                messageIndex === 0 ||
                group.messages[messageIndex - 1].sender_id !==
                  message.sender_id;

              return (
                <div
                  key={message.id}
                  className={`message ${
                    message.isOwned ? "outgoing" : "incoming"
                  }`}
                >
                  {!message.isOwned && showAvatar && (
                    <div className="message-avatar">
                      <img
                        src={message.user.avatar || "/icons/placeholder.svg"}
                        alt={message.user.nickname}
                      />
                    </div>
                  )}

                  <div className="message-content">
                    {!message.isOwned && showAvatar && (
                      <div className="message-user">
                        {message.user.nickname}
                      </div>
                    )}
                    <div className="message-bubble">
                      <p>{message.text}</p>
                      <span className="message-time">{message.created_at}</span>
                    </div>
                  </div>
                </div>
              );
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
              e.preventDefault();
              handleSendMessage(e);
            }
          }}
        />

        <button
          type="submit"
          className="send-button"
          disabled={!messageInput.trim()}
        >
          &#10148;
        </button>
      </form>
    </div>
  );
}
