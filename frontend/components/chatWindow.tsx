"use client";

import type React from "react";
import { useState, useRef, useEffect } from "react";
import getMessages from "@/api/messages/getMesages";
import { addMessage } from "@/helpers/addMessage";
import { onMessageType, socket } from "@/helpers/webSocket";
import getToken from "@/api/auth/getToken";
import Popup from "@/app/app/popup";
import { Chat } from "@/types/chat";
import { AddMessageEvent, Message } from "@/types/message";
import Image from "next/image";

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
  const [popup, setPopup] = useState<{ message: string; status: "success" | "failure" } | null>(null);
  

  // Scroll to bottom when messages change
  useEffect(() => {
    const initMessages = async () => {
      const id = Number(chat?.id.split("_")[1]);
      if (!id) return;
      try {
        const data = await getMessages(id, chat?.isGroup || false);
        if (data.error) {
          setPopup({ message: data.error, status: "failure" });
          return;
        }

        setMessages(data?.messages);
      } catch (error) {
        setPopup({ message: `${error}`, status: "failure" });
      }
    };
    initMessages();

    const currentChatId = Number(chat?.id.split("_")[1]);

    const unsubscribe = onMessageType(
      "addMessage",
      async (data: AddMessageEvent) => {
        const isGroup = chat?.isGroup;
        const isMatch = isGroup
          ? data.message.group_id === currentChatId
          : data.message.sender_id === currentChatId ||
            data.message.recipient_id === currentChatId;

        console.log("- - - - - -", chat, isGroup, isMatch);

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
          setPopup({ message: `${error}`, status: "failure" });
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
      setPopup({ message: `${error}`, status: "failure" });
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
                      <Image
                        src={
                          message.user.avatar
                            ? `http://localhost:8080/getProtectedImage?type=avatars&id=0&path=${encodeURIComponent(
                                message.user.avatar
                              )}`
                            : "/icons/placeholder.svg"
                        }
                        alt="user avatar"
                        width={40}
                        height={40}
                        unoptimized
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
