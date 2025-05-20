"use client";

import { useState } from "react";
import ChatList from "@/app/_components/chatList";
import ChatWindow from "@/app/_components/chatWindow";
import "./chat.css";
import { Chat } from "@/app/_components/chatList";

export default function ChatPage() {
  const [activeChat, setActiveChat] = useState<Chat | null>(null);

  return (
    <div className="chat-page">
      <div className="chat-container">
        <ChatList
          activeChat={activeChat}
          setActiveChat={setActiveChat}
        />
        <ChatWindow
          chat={activeChat}
        />
      </div>
    </div>
  );
}
