"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import "./styles.css"

// Mock data for demonstration
const MOCK_USERS = [
  { id: 1, username: "john_doe", name: "John Doe", avatar: "/icons/placeholder.svg" },
  { id: 2, username: "jane_smith", name: "Jane Smith", avatar: "/icons/placeholder.svg" },
  { id: 3, username: "mike_johnson", name: "Mike Johnson", avatar: "/icons/placeholder.svg" },
  { id: 4, username: "sarah_williams", name: "Sarah Williams", avatar: "/icons/placeholder.svg" },
  { id: 5, username: "alex_brown", name: "Alex Brown", avatar: "/icons/placeholder.svg" },
  { id: 6, username: "emily_davis", name: "Emily Davis", avatar: "/icons/placeholder.svg" },
  { id: 7, username: "david_miller", name: "David Miller", avatar: "/icons/placeholder.svg" },
  { id: 8, username: "olivia_wilson", name: "Olivia Wilson", avatar: "/icons/placeholder.svg" },
]

const MOCK_FOLLOW_REQUESTS = [
  { id: 9, username: "robert_taylor", name: "Robert Taylor", avatar: "/icons/placeholder.svg" },
  { id: 10, username: "sophia_anderson", name: "Sophia Anderson", avatar: "/icons/placeholder.svg" },
  { id: 11, username: "james_thomas", name: "James Thomas", avatar: "/icons/placeholder.svg" },
]

export default function ProfilePage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [followRequests, setFollowRequests] = useState(MOCK_FOLLOW_REQUESTS)
  const [users, setUsers] = useState(MOCK_USERS)
  const [followingStatus, setFollowingStatus] = useState<Record<number, string>>({})

  // Filter users based on search term
  const filteredUsers = users.filter(
    (user) =>
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.name.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }

  // Handle follow request
  const handleFollowRequest = (userId: number) => {
    setFollowingStatus((prev) => ({
      ...prev,
      [userId]: "requested",
    }))
  }

  // Handle accept follow request
  const handleAcceptRequest = (userId: number) => {
    setFollowRequests((prev) => prev.filter((request) => request.id !== userId))
    // In a real app, you would update the database here
  }

  // Handle decline follow request
  const handleDeclineRequest = (userId: number) => {
    setFollowRequests((prev) => prev.filter((request) => request.id !== userId))
    // In a real app, you would update the database here
  }

  // Navigate to user profile
  const navigateToProfile = (id: number) => {
    router.push(`/app/profiles/${id}`)
  }

  return (
    <div className="profile-container">
      <header className="profile-header">
        <h1>Profile</h1>
      </header>

      <section className="search-section">
        <div className="search-container">
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="search-input"
          />
          {searchTerm && (
            <button className="clear-search" onClick={() => setSearchTerm("")} aria-label="Clear search">
              ×
            </button>
          )}
        </div>
      </section>

      {followRequests.length > 0 && (
        <section className="follow-requests-section">
          <h2>Follow Requests</h2>
          <div className="follow-requests-list">
            {followRequests.map((request) => (
              <div key={request.id} className="user-card request-card">
                <div
                  className="user-info"
                  onClick={() => navigateToProfile(request.id)}
                  style={{ cursor: "pointer" }}
                >
                  <img src={request.avatar || "/placeholder.svg"} alt={request.username} className="user-avatar" />
                  <div className="user-details">
                    <span className="user-name">{request.name}</span>
                    <span className="username">@{request.username}</span>
                  </div>
                </div>
                <div className="request-actions">
                  <button className="accept-button" onClick={() => handleAcceptRequest(request.id)}>
                    Accept
                  </button>
                  <button className="decline-button" onClick={() => handleDeclineRequest(request.id)}>
                    Decline
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="users-section">
        <h2>Suggested Users</h2>
        <div className="users-list">
          {filteredUsers.map((user) => (
            <div key={user.id} className="user-card">
              <div className="user-info" onClick={() => navigateToProfile(user.id)} style={{ cursor: "pointer" }}>
                <img src={user.avatar || "/placeholder.svg"} alt={user.username} className="user-avatar" />
                <div className="user-details">
                  <span className="user-name">{user.name}</span>
                  <span className="username">@{user.username}</span>
                </div>
              </div>
              <button
                className={`follow-button ${followingStatus[user.id] ? "requested" : ""}`}
                onClick={() => handleFollowRequest(user.id)}
                disabled={followingStatus[user.id] === "requested"}
              >
                {followingStatus[user.id] === "requested" ? "Requested" : "Follow"}
              </button>
            </div>
          ))}
          {filteredUsers.length === 0 && searchTerm && (
            <div className="no-results">No users found matching "{searchTerm}"</div>
          )}
        </div>
      </section>
    </div>
  )
}
