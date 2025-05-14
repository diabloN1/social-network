"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ChatList from "@/app/_components/chatList";
import ChatWindow from "@/app/_components/chatWindow";
import "./chat.css";
import getChatData from "@/app/api/_messages/getChatData";
import { Chat } from "@/app/_components/chatList";

// Types
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
  content: string;
  created_at: string;
  sender: User;
}

export default function ChatPage() {
  const router = useRouter();
  const [activeChat, setActiveChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);

  // Mock API response
  useEffect(() => {

  }, []);


  // Handle sending a message
  const handleSendMessage = (content: string) => {
    
  };

  return (
    <div className="chat-page">
      <div className="chat-container">
        <ChatList
          activeChat={activeChat}
          onSelectChat={setActiveChat}
        />
        <ChatWindow
          chat={activeChat}
          messages={messages}
          onSendMessage={handleSendMessage}
        />
      </div>
    </div>
  );
}
