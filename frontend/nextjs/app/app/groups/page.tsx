"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import "./styles.css"
import CreateGroupModal from "@/app/_components/create-group-modal"
import createGroup from "@/app/api/_groups/createGroup"
import getGroups from "@/app/api/_groups/getGroups"

// Mock data for groups
const MOCK_GROUPS = [
  {
    id: 1,
    title: "Photography Enthusiasts",
    description: "A group for sharing photography tips and showcasing your best shots.",
    creator: {
      id: 1,
      username: "john_doe",
      name: "John Doe",
      avatar: "/icons/placeholder.svg",
    },
    members: [
      { id: 1, username: "john_doe", name: "John Doe", avatar: "/icons/placeholder.svg" },
      { id: 2, username: "jane_smith", name: "Jane Smith", avatar: "/icons/placeholder.svg" },
      { id: 7, username: "david_miller", name: "David Miller", avatar: "/icons/placeholder.svg" },
    ],
    posts: 24,
    events: 3,
    isMember: true,
    isCreator: true,
    image: "/icons/placeholder.svg", // Add this line
  },
  {
    id: 2,
    title: "Web Development",
    description: "Discussions about web development, frameworks, and best practices.",
    creator: {
      id: 3,
      username: "mike_johnson",
      name: "Mike Johnson",
      avatar: "/icons/placeholder.svg",
    },
    members: [
      { id: 3, username: "mike_johnson", name: "Mike Johnson", avatar: "/icons/placeholder.svg" },
      { id: 1, username: "john_doe", name: "John Doe", avatar: "/icons/placeholder.svg" },
      { id: 5, username: "alex_brown", name: "Alex Brown", avatar: "/icons/placeholder.svg" },
    ],
    posts: 42,
    events: 5,
    isMember: true,
    isCreator: false,
    image: "/icons/placeholder.svg", // Add this line
  },
  {
    id: 3,
    title: "Fitness Motivation",
    description: "Share your fitness journey, workouts, and motivate each other.",
    creator: {
      id: 4,
      username: "sarah_williams",
      name: "Sarah Williams",
      avatar: "/icons/placeholder.svg",
    },
    members: [
      { id: 4, username: "sarah_williams", name: "Sarah Williams", avatar: "/icons/placeholder.svg" },
      { id: 6, username: "emily_davis", name: "Emily Davis", avatar: "/icons/placeholder.svg" },
    ],
    posts: 18,
    events: 2,
    isMember: false,
    isCreator: false,
    image: "/icons/placeholder.svg", // Add this line
  },
  {
    id: 4,
    title: "Book Club",
    description: "Discuss your favorite books and find new reading recommendations.",
    creator: {
      id: 2,
      username: "jane_smith",
      name: "Jane Smith",
      avatar: "/icons/placeholder.svg",
    },
    members: [
      { id: 2, username: "jane_smith", name: "Jane Smith", avatar: "/icons/placeholder.svg" },
      { id: 8, username: "olivia_wilson", name: "Olivia Wilson", avatar: "/icons/placeholder.svg" },
    ],
    posts: 31,
    events: 4,
    isMember: false,
    isCreator: false,
    image: "/icons/placeholder.svg", // Add this line
  },
]

// Mock data for group invitations
const MOCK_INVITATIONS = [
  {
    id: 1,
    group: {
      id: 5,
      title: "Travel Enthusiasts",
      description: "Share travel experiences, tips, and destinations.",
      creator: { id: 5, username: "alex_brown", name: "Alex Brown", avatar: "/icons/placeholder.svg" },
    },
    invitedBy: { id: 5, username: "alex_brown", name: "Alex Brown", avatar: "/icons/placeholder.svg" },
    date: "2023-10-15T09:30:00Z",
  },
]

// Mock data for join requests (only visible to group creators)
const MOCK_REQUESTS = [
  {
    id: 1,
    user: { id: 6, username: "emily_davis", name: "Emily Davis", avatar: "/icons/placeholder.svg" },
    group: { id: 1, title: "Photography Enthusiasts" },
    date: "2023-10-17T14:22:00Z",
  },
]

export default function GroupsPage() {
  const router = useRouter()
  const [groups, setGroups] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const [showCreateModal, setShowCreateModal] = useState(false)

  const initData = async () => {
    try {
      const data = await getGroups()
      if (data.error) {
        alert(data.error)
        return
      }

      console.log(data)
      setGroups(data.all)
    } catch(error) {
      alert(error)
    }
  }

  useEffect(() => {
    initData()
  }, [])
  // Filter groups based on search term and active tab
  const filteredGroups = groups?.filter((group: any) => {
    const matchesSearch =
      group.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      group.description.toLowerCase().includes(searchTerm.toLowerCase())

    if (activeTab === "all") return matchesSearch
    if (activeTab === "my-groups") return matchesSearch && group.is_accepted
    if (activeTab === "created") return matchesSearch && group.is_owner

    return matchesSearch
  })

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }

  // Handle group creation
  const handleCreateGroup = async (group: { image: string; title: string; description: string }) => {

    try {
      const data = await createGroup(group)
      if (data.error) {
        alert(data.error)
        return
      }

      setShowCreateModal(false)
    } catch(error) {
      alert(error)
    }
  }

  // Handle joining a group
  const handleJoinGroup = (groupId: number) => {
    // In a real app, you would send this to the backend
    console.log("Requesting to join group:", groupId)

    // For demo purposes, we'll just log it
    // Normally you would update the UI to show a pending request
  }

  // Handle responding to invitations
  const handleInvitationResponse = (invitationId: number, accept: boolean) => {
    // In a real app, you would send this to the backend
    console.log(`${accept ? "Accepting" : "Declining"} invitation:`, invitationId)

    // For demo purposes, we'll just remove the invitation from the list
    // Normally you would update the groups list as well
  }

  // Handle responding to join requests (as group creator)
  const handleRequestResponse = (requestId: number, accept: boolean) => {
    // In a real app, you would send this to the backend
    console.log(`${accept ? "Accepting" : "Declining"} join request:`, requestId)

    // For demo purposes, we'll just remove the request from the list
  }

  // Navigate to group detail page
  const navigateToGroup = (groupId: number) => {
    router.push(`/app/groups/${groupId}`)
  }

  return (
    <div className="groups-container">
      <header className="groups-header">
        <h1>Groups</h1>
        <button className="create-group-button" onClick={() => setShowCreateModal(true)}>
          Create Group
        </button>
      </header>

      <section className="search-section">
        <div className="search-container">
          <input
            type="text"
            placeholder="Search groups..."
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

      {MOCK_INVITATIONS.length > 0 && (
        <section className="invitations-section">
          <h2>Group Invitations</h2>
          <div className="invitations-list">
            {MOCK_INVITATIONS.map((invitation) => (
              <div key={invitation.id} className="invitation-card">
                <div className="invitation-info">
                  <img
                    src={invitation.group.creator.avatar || "/icons/placeholder.svg"}
                    alt={invitation.group.creator.name}
                    className="user-avatar"
                  />
                  <div className="invitation-details">
                    <span className="invitation-title">
                      <strong>{invitation.invitedBy.name}</strong> invited you to join{" "}
                      <strong>{invitation.group.title}</strong>
                    </span>
                    <span className="invitation-description">{invitation.group.description}</span>
                    <span className="invitation-date">{new Date(invitation.date).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="invitation-actions">
                  <button className="accept-button" onClick={() => handleInvitationResponse(invitation.id, true)}>
                    Accept
                  </button>
                  <button className="decline-button" onClick={() => handleInvitationResponse(invitation.id, false)}>
                    Decline
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {MOCK_REQUESTS.length > 0 && (
        <section className="requests-section">
          <h2>Join Requests</h2>
          <div className="requests-list">
            {MOCK_REQUESTS.map((request) => (
              <div key={request.id} className="request-card">
                <div className="request-info">
                  <img
                    src={request.user.avatar || "/icons/placeholder.svg"}
                    alt={request.user.name}
                    className="user-avatar"
                  />
                  <div className="request-details">
                    <span className="request-title">
                      <strong>{request.user.name}</strong> wants to join <strong>{request.group.title}</strong>
                    </span>
                    <span className="request-date">{new Date(request.date).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="request-actions">
                  <button className="accept-button" onClick={() => handleRequestResponse(request.id, true)}>
                    Accept
                  </button>
                  <button className="decline-button" onClick={() => handleRequestResponse(request.id, false)}>
                    Decline
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <div className="groups-tabs">
        <button className={`tab ${activeTab === "all" ? "active" : ""}`} onClick={() => setActiveTab("all")}>
          All Groups
        </button>
        <button
          className={`tab ${activeTab === "my-groups" ? "active" : ""}`}
          onClick={() => setActiveTab("my-groups")}
        >
          My Groups
        </button>
        <button className={`tab ${activeTab === "created" ? "active" : ""}`} onClick={() => setActiveTab("created")}>
          Created by Me
        </button>
      </div>

      <div className="groups-list">
        {filteredGroups?.length > 0 ? (
          filteredGroups.map((group: any) => (
            <div key={group.id} className="group-card">
              <div className="group-image" onClick={() => navigateToGroup(group.id)}>
                <img src={group.image || "/icons/placeholder.svg"} alt={group.title} />
              </div>
              <div className="group-info" onClick={() => navigateToGroup(group.id)}>
                <h3 className="group-title">{group.title}</h3>
              </div>
            </div>
          ))
        ) : (
          <div className="no-groups-message">
            {searchTerm
              ? `No groups found matching "${searchTerm}"`
              : activeTab === "my-groups"
                ? "You haven't joined any groups yet"
                : activeTab === "created"
                  ? "You haven't created any groups yet"
                  : "No groups available"}
          </div>
        )}
      </div>

      {/* Create Group Modal */}
      {showCreateModal && (<CreateGroupModal onClose={() => setShowCreateModal(false)} onSubmit={handleCreateGroup} />)}
    </div>
  )
}
