"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import ChatList from "../../_components/chatList"
import ChatWindow from "../../_components/chatWindow"
import "./chat.css"

// Types
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

interface Chat {
  id: string // user_id or group_id prefixed with "user_" or "group_"
  name: string
  avatar: string
  lastMessage?: string
  lastMessageTime?: string
  unreadCount: number
  isGroup: boolean
  isOnline?: boolean
  members?: User[]
}

export default function ChatPage() {
  const router = useRouter()
  const [chats, setChats] = useState<Chat[]>([])
  const [activeChat, setActiveChat] = useState<Chat | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)

  // Mock data for demonstration
  useEffect(() => {
    // Simulate fetching chats
    const mockChats: Chat[] = [
      {
        id: "user_1",
        name: "John Doe",
        avatar: "/placeholder.svg?height=50&width=50",
        lastMessage: "Hey, how are you?",
        lastMessageTime: "10:30 AM",
        unreadCount: 2,
        isGroup: false,
        isOnline: true,
      },
      {
        id: "user_2",
        name: "Jane Smith",
        avatar: "/placeholder.svg?height=50&width=50",
        lastMessage: "Can we meet tomorrow?",
        lastMessageTime: "Yesterday",
        unreadCount: 0,
        isGroup: false,
        isOnline: false,
      },
      {
        id: "group_1",
        name: "Photography Club",
        avatar: "/placeholder.svg?height=50&width=50",
        lastMessage: "New event this weekend!",
        lastMessageTime: "2 days ago",
        unreadCount: 5,
        isGroup: true,
        members: [
          {
            id: 1,
            username: "john_doe",
            firstname: "John",
            lastname: "Doe",
            nickname: "Johnny",
            avatar: "/placeholder.svg?height=50&width=50",
            online: true,
          },
          {
            id: 2,
            username: "jane_smith",
            firstname: "Jane",
            lastname: "Smith",
            nickname: "Janey",
            avatar: "/placeholder.svg?height=50&width=50",
            online: false,
          },
        ],
      },
      {
        id: "group_2",
        name: "Travel Enthusiasts",
        avatar: "/placeholder.svg?height=50&width=50",
        lastMessage: "Check out these photos from Paris!",
        lastMessageTime: "1 week ago",
        unreadCount: 0,
        isGroup: true,
        members: [
          {
            id: 1,
            username: "john_doe",
            firstname: "John",
            lastname: "Doe",
            nickname: "Johnny",
            avatar: "/placeholder.svg?height=50&width=50",
            online: true,
          },
          {
            id: 3,
            username: "mike_johnson",
            firstname: "Mike",
            lastname: "Johnson",
            nickname: "Mikey",
            avatar: "/placeholder.svg?height=50&width=50",
            online: true,
          },
        ],
      },
    ]

    setChats(mockChats)
    setLoading(false)
  }, [])

  // Load messages when active chat changes
  useEffect(() => {
    if (!activeChat) return

    setLoading(true)

    // In a real app, you would fetch messages from your API
    // For demonstration, we'll use mock data
    const mockMessages: Message[] = []

    // Generate some mock messages
    const isGroup = activeChat.isGroup
    const chatId = Number.parseInt(activeChat.id.split("_")[1])

    // Number of messages to generate
    const messageCount = Math.floor(Math.random() * 10) + 5

    for (let i = 0; i < messageCount; i++) {
      const isCurrentUser = Math.random() > 0.5

      mockMessages.push({
        id: i,
        sender_id: isCurrentUser ? 0 : chatId,
        receiver_id: isCurrentUser ? chatId : 0,
        group_id: isGroup ? chatId : undefined,
        content: getRandomMessage(),
        created_at: getRandomDate(),
        sender: {
          id: isCurrentUser ? 0 : chatId,
          username: isCurrentUser ? "current_user" : "other_user",
          firstname: isCurrentUser ? "Current" : activeChat.name.split(" ")[0],
          lastname: isCurrentUser ? "User" : activeChat.name.split(" ")[1] || "",
          nickname: isCurrentUser ? "Me" : activeChat.name,
          avatar: isCurrentUser ? "/placeholder.svg?height=50&width=50" : activeChat.avatar,
          online: isCurrentUser ? true : activeChat.isOnline || false,
        },
      })
    }

    // Sort messages by date
    mockMessages.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())

    setMessages(mockMessages)
    setLoading(false)

    // Mark messages as read
    if (activeChat.unreadCount > 0) {
      setChats((prev) =>
        prev.map((chat) => {
          if (chat.id === activeChat.id) {
            return {
              ...chat,
              unreadCount: 0,
            }
          }
          return chat
        }),
      )
    }
  }, [activeChat])

  // Helper function to generate random messages
  const getRandomMessage = () => {
    const messages = [
      "Hey, how are you?",
      "What are you up to?",
      "Did you see the latest post?",
      "I'm working on a new project.",
      "Let's meet up soon!",
      "Have you tried the new restaurant downtown?",
      "I just finished reading an amazing book.",
      "Can you help me with something?",
      "Check out this link: https://example.com",
      "😊",
      "👍",
      "🎉",
      "I'll be there in 10 minutes.",
      "Don't forget about our meeting tomorrow.",
      "Thanks for your help!",
    ]

    return messages[Math.floor(Math.random() * messages.length)]
  }

  // Helper function to generate random dates within the last week
  const getRandomDate = () => {
    const now = new Date()
    const randomDays = Math.floor(Math.random() * 7)
    const randomHours = Math.floor(Math.random() * 24)
    const randomMinutes = Math.floor(Math.random() * 60)

    now.setDate(now.getDate() - randomDays)
    now.setHours(now.getHours() - randomHours)
    now.setMinutes(now.getMinutes() - randomMinutes)

    return now.toISOString()
  }

  // Handle sending a message
  const handleSendMessage = (content: string) => {
    if (!activeChat || !content.trim()) return

    const [type, id] = activeChat.id.split("_")
    const isGroup = type === "group"

    // Create a new message
    const newMessage: Message = {
      id: Math.floor(Math.random() * 1000),
      sender_id: 0, // Current user
      receiver_id: isGroup ? undefined : Number.parseInt(id),
      group_id: isGroup ? Number.parseInt(id) : undefined,
      content,
      created_at: new Date().toISOString(),
      sender: {
        id: 0,
        username: "current_user",
        firstname: "Current",
        lastname: "User",
        nickname: "Me",
        avatar: "/placeholder.svg?height=50&width=50",
        online: true,
      },
    }

    setMessages((prev) => [...prev, newMessage])

    // Update the chat list with the new message
    setChats((prev) =>
      prev.map((chat) => {
        if (chat.id === activeChat.id) {
          return {
            ...chat,
            lastMessage: content,
            lastMessageTime: "Just now",
          }
        }
        return chat
      }),
    )

    // Simulate receiving a reply for private chats
    if (!isGroup) {
      setTimeout(() => {
        const replyContent = [
          "Thanks for your message!",
          "I'll get back to you soon.",
          "That sounds great!",
          "👍",
          "😊",
          "Interesting, tell me more!",
        ]

        const randomReply = replyContent[Math.floor(Math.random() * replyContent.length)]

        const replyMessage: Message = {
          id: Math.floor(Math.random() * 1000),
          sender_id: Number.parseInt(id),
          receiver_id: 0, // Current user
          content: randomReply,
          created_at: new Date().toISOString(),
          sender: {
            id: Number.parseInt(id),
            username: "other_user",
            firstname: activeChat.name.split(" ")[0],
            lastname: activeChat.name.split(" ")[1] || "",
            nickname: activeChat.name,
            avatar: activeChat.avatar,
            online: activeChat.isOnline || false,
          },
        }

        setMessages((prev) => [...prev, replyMessage])

        // Update the chat list with the new message
        setChats((prev) =>
          prev.map((chat) => {
            if (chat.id === activeChat.id) {
              return {
                ...chat,
                lastMessage: randomReply,
                lastMessageTime: "Just now",
              }
            }
            return chat
          }),
        )
      }, 2000)
    }
  }

  return (
    <div className="chat-page">
      <div className="chat-container">
        <ChatList chats={chats} activeChat={activeChat} onSelectChat={setActiveChat} loading={loading} />
        <ChatWindow chat={activeChat} messages={messages} onSendMessage={handleSendMessage} loading={loading} />
      </div>
    </div>
  )
}
