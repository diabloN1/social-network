"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import "./group.css"

// Types
interface User {
  id: number
  username: string
  name: string
  avatar: string
}

interface Post {
  id: number
  content: string
  creator: User
  createdAt: string
  likes: number
  comments: number
}

interface Comment {
  id: number
  content: string
  creator: User
  createdAt?    : string
}

interface Event {
  id: number
  title: string
  description: string
  creator: User
  date: string
  location?: string
  responses: {
    going: User[]
    notGoing: User[]
  }
}

interface Group {
  id: number
  title: string
  description: string
  creator: User
  members: User[]
  posts: Post[]
  events: Event[]
  isMember: boolean
  isCreator: boolean
  pendingRequests?: User[]
  image: string // Add this line
}

// Mock data for a single group
const getMockGroup = (id: number): Group => {
  return {
    id,
    title: "Photography Enthusiasts",
    description:
      "A group for sharing photography tips and showcasing your best shots. Join us to learn more about photography techniques, equipment, and to connect with fellow photographers.",
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
    posts: [
      {
        id: 1,
        content: "Just got a new Canon EOS R5. The image quality is amazing! Has anyone else tried it?",
        creator: { id: 1, username: "john_doe", name: "John Doe", avatar: "/icons/placeholder.svg" },
        createdAt: "2023-10-20T14:30:00Z",
        likes: 12,
        comments: 5,
      },
      {
        id: 2,
        content:
          "Here's a tip for landscape photography: Try using a polarizing filter to reduce reflections and enhance colors, especially on sunny days.",
        creator: { id: 2, username: "jane_smith", name: "Jane Smith", avatar: "/icons/placeholder.svg" },
        createdAt: "2023-10-19T10:15:00Z",
        likes: 8,
        comments: 3,
      },
    ],
    events: [
      {
        id: 1,
        title: "City Sunset Photography Meetup",
        description:
          "Let's meet up to capture the beautiful sunset over the city skyline. Bring your camera and tripod!",
        creator: { id: 1, username: "john_doe", name: "John Doe", avatar: "/icons/placeholder.svg" },
        date: "2023-11-15T17:00:00Z",
        location: "Central Park Observation Point",
        responses: {
          going: [
            { id: 1, username: "john_doe", name: "John Doe", avatar: "/icons/placeholder.svg" },
            { id: 2, username: "jane_smith", name: "Jane Smith", avatar: "/icons/placeholder.svg" },
          ],
          notGoing: [{ id: 7, username: "david_miller", name: "David Miller", avatar: "/icons/placeholder.svg" }],
        },
      },
    ],
    isMember: true,
    isCreator: true,
    pendingRequests: [{ id: 5, username: "alex_brown", name: "Alex Brown", avatar: "/icons/placeholder.svg" }],
    image: "/placeholder.svg?height=300&width=600", // Add this line
  }
}

// Mock function to get post comments
const getMockComments = (postId: number): Comment[] => {
  return [
    {
      id: 1,
      content: "I've been thinking about getting one too! How's the battery life?",
      creator: { id: 2, username: "jane_smith", name: "Jane Smith", avatar: "/icons/placeholder.svg" },
    },
    {
      id: 2,
      content: "Great tip! I always carry a polarizing filter with me. Makes a huge difference.",
      creator: { id: 7, username: "david_miller", name: "David Miller", avatar: "/icons/placeholder.svg" },
    },
    {
      id: 3,
      content: "Has anyone tried astrophotography with their DSLR?",
      creator: { id: 1, username: "john_doe", name: "John Doe", avatar: "/icons/placeholder.svg" },
    },
  ]
}

export default function GroupPage() {
  const params = useParams()
  const router = useRouter()
  const groupId = Number.parseInt(params.id as string, 10)

  const [group, setGroup] = useState<Group | null>(null)
  const [activeTab, setActiveTab] = useState("posts")
  const [showMembersModal, setShowMembersModal] = useState(false)
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [showCreatePostModal, setShowCreatePostModal] = useState(false)
  const [showCreateEventModal, setShowCreateEventModal] = useState(false)
  const [showComments, setShowComments] = useState<Record<number, boolean>>({})
  const [newPost, setNewPost] = useState("")
  const [newEvent, setNewEvent] = useState({
    title: "",
    description: "",
    date: "",
    location: "",
  })
  const [loading, setLoading] = useState(true)
  const [inviteUsername, setInviteUsername] = useState("")

  useEffect(() => {
    const fetchGroupData = async () => {
      setLoading(true)
      try {
        // In a real app, you would fetch the group data from your API
        // For this demo, we'll use mock data
        const groupData = getMockGroup(groupId)
        setGroup(groupData)
      } catch (error) {
        console.error("Error fetching group data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchGroupData()
  }, [groupId])

  // Go back to groups list
  const goBack = () => {
    router.push("/app/groups")
  }

  // Toggle comments visibility
  const toggleComments = (postId: number) => {
    setShowComments((prev) => ({
      ...prev,
      [postId]: !prev[postId],
    }))
  }

  // Handle creating a new post
  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault()

    if (!group || !newPost.trim()) return

    // In a real app, you would send this to your API
    console.log("Creating new post:", newPost)

    // For demo purposes, we'll add it to the state
    const newPostObj: Post = {
      id: Date.now(),
      content: newPost,
      creator: {
        id: 1, // Current user
        username: "john_doe",
        name: "John Doe",
        avatar: "/icons/placeholder.svg",
      },
      createdAt: new Date().toISOString(),
      likes: 0,
      comments: 0,
    }

    setGroup({
      ...group,
      posts: [newPostObj, ...group.posts],
    })

    setNewPost("")
    setShowCreatePostModal(false)
  }

  // Handle creating a new event
  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault()

    if (!group) return

    // In a real app, you would send this to your API
    console.log("Creating new event:", newEvent)

    // For demo purposes, we'll add it to the state
    const newEventObj: Event = {
      id: Date.now(),
      title: newEvent.title,
      description: newEvent.description,
      creator: {
        id: 1, // Current user
        username: "john_doe",
        name: "John Doe",
        avatar: "/icons/placeholder.svg",
      },
      date: newEvent.date,
      location: newEvent.location,
      responses: {
        going: [{ id: 1, username: "john_doe", name: "John Doe", avatar: "/icons/placeholder.svg" }],
        notGoing: [],
      },
    }

    setGroup({
      ...group,
      events: [newEventObj, ...group.events],
    })

    setNewEvent({
      title: "",
      description: "",
      date: "",
      location: "",
    })
    setShowCreateEventModal(false)
  }

  // Handle responding to an event
  const handleEventResponse = (eventId: number, going: boolean) => {
    if (!group) return

    // In a real app, you would send this to your API
    console.log(`Responding to event ${eventId}: ${going ? "Going" : "Not Going"}`)

    // For demo purposes, we'll update the state
    const updatedEvents = group.events.map((event) => {
      if (event.id === eventId) {
        // Current user info
        const currentUser = {
          id: 1,
          username: "john_doe",
          name: "John Doe",
          avatar: "/icons/placeholder.svg",
        }

        // Remove from both lists first
        const filteredGoing = event.responses.going.filter((user) => user.id !== currentUser.id)
        const filteredNotGoing = event.responses.notGoing.filter((user) => user.id !== currentUser.id)

        // Add to the appropriate list
        return {
          ...event,
          responses: {
            going: going ? [...filteredGoing, currentUser] : filteredGoing,
            notGoing: going ? filteredNotGoing : [...filteredNotGoing, currentUser],
          },
        }
      }
      return event
    })

    setGroup({
      ...group,
      events: updatedEvents,
    })
  }

  // Handle inviting a user
  const handleInviteUser = (e: React.FormEvent) => {
    e.preventDefault()

    if (!inviteUsername.trim()) return

    // In a real app, you would send this to your API
    console.log("Inviting user:", inviteUsername)

    // For demo purposes, we'll just close the modal
    setInviteUsername("")
    setShowInviteModal(false)
  }

  // Handle accepting/rejecting a join request
  const handleJoinRequest = (userId: number, accept: boolean) => {
    if (!group) return

    // In a real app, you would send this to your API
    console.log(`${accept ? "Accepting" : "Rejecting"} join request from user ${userId}`)

    // For demo purposes, we'll update the state
    const updatedPendingRequests = group.pendingRequests?.filter((user) => user.id !== userId) || []

    const updatedMembers = [...group.members]
    if (accept) {
      const userToAdd = group.pendingRequests?.find((user) => user.id === userId)
      if (userToAdd) {
        updatedMembers.push(userToAdd)
      }
    }

    setGroup({
      ...group,
      members: updatedMembers,
      pendingRequests: updatedPendingRequests,
    })
  }

  // Handle joining a group
  const handleJoinGroup = (groupId: number) => {
    // In a real app, you would send this to the backend
    console.log("Requesting to join group:", groupId)

    // For demo purposes, we'll just log it
    // Normally you would update the UI to show a pending request
    alert("Join request sent! Waiting for approval.")
  }

  if (loading) {
    return (
      <div className="group-container">
        <div className="loading-spinner">Loading...</div>
      </div>
    )
  }

  if (!group) {
    return (
      <div className="group-container">
        <div className="error-message">Group not found</div>
      </div>
    )
  }

  return (
    <div className="group-container">
      <button className="back-button" onClick={goBack}>
        ← Back to Groups
      </button>

      <div className="group-header">
        <div className="group-image">
          <img src={group.image || "/placeholder.svg"} alt={group.title} />
        </div>
        <div className="group-title-section">
          <h1>{group.title}</h1>
          <p className="group-description">{group.description}</p>
        </div>

        <div className="group-actions">
          {group.isMember && (
            <>
              <button className="action-button" onClick={() => setShowCreatePostModal(true)}>
                Create Post
              </button>
              <button className="action-button" onClick={() => setShowCreateEventModal(true)}>
                Create Event
              </button>
              <button className="action-button" onClick={() => setShowInviteModal(true)}>
                Invite Users
              </button>
            </>
          )}
          {!group.isMember && (
            <button className="action-button" onClick={() => handleJoinGroup(group.id)}>
              Request to Join
            </button>
          )}
        </div>

        <div className="group-meta">
          <div className="group-members-preview" onClick={() => setShowMembersModal(true)}>
            <span>Members ({group.members.length})</span>
            <div className="members-avatars">
              {group.members.slice(0, 3).map((member) => (
                <img
                  key={member.id}
                  src={member.avatar || "/icons/placeholder.svg"}
                  alt={member.name}
                  className="member-avatar"
                  title={member.name}
                />
              ))}
              {group.members.length > 3 && <span className="more-members">+{group.members.length - 3}</span>}
            </div>
          </div>

          <div className="group-creator">
            <span>Created by {group.creator.name}</span>
          </div>
        </div>
      </div>

      {!group.isMember ? (
        <div className="non-member-view">
          <div className="join-message">
            <h3>This is a private group</h3>
            <p>Join this group to see posts, events, and interact with members.</p>
            <button className="join-button" onClick={() => handleJoinGroup(group.id)}>
              Request to Join
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Join Requests (only visible to group creator) */}
          {group.isCreator && group.pendingRequests && group.pendingRequests.length > 0 && (
            <div className="join-requests-section">
              <h3>Pending Join Requests</h3>
              <div className="join-requests-list">
                {group.pendingRequests.map((user) => (
                  <div key={user.id} className="join-request">
                    <div className="user-info">
                      <img src={user.avatar || "/icons/placeholder.svg"} alt={user.name} className="user-avatar" />
                      <span>{user.name}</span>
                    </div>
                    <div className="request-actions">
                      <button className="accept-button" onClick={() => handleJoinRequest(user.id, true)}>
                        Accept
                      </button>
                      <button className="decline-button" onClick={() => handleJoinRequest(user.id, false)}>
                        Decline
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Content Tabs */}
          <div className="group-tabs">
            <button className={`tab ${activeTab === "posts" ? "active" : ""}`} onClick={() => setActiveTab("posts")}>
              Posts
            </button>
            <button className={`tab ${activeTab === "events" ? "active" : ""}`} onClick={() => setActiveTab("events")}>
              Events
            </button>
          </div>

          {/* Posts Tab */}
          {activeTab === "posts" && (
            <div className="group-posts">
              {group.posts.length === 0 ? (
                <div className="no-content">No posts yet. Be the first to post!</div>
              ) : (
                group.posts.map((post) => (
                  <div key={post.id} className="post-card">
                    <div className="post-header">
                      <div className="post-creator">
                        <img
                          src={post.creator.avatar || "/icons/placeholder.svg"}
                          alt={post.creator.name}
                          className="user-avatar"
                        />
                        <div className="creator-info">
                          <span className="creator-name">{post.creator.name}</span>
                          <span className="post-date">{new Date(post.createdAt).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    <div className="post-content">{post.content}</div>

                    <div className="post-actions">
                      <button className="post-action">Like ({post.likes})</button>
                      <button className="post-action" onClick={() => toggleComments(post.id)}>
                        Comments ({post.comments})
                      </button>
                    </div>

                    {showComments[post.id] && (
                      <div className="post-comments">
                        {getMockComments(post.id).map((comment) => (
                          <div key={comment.id} className="comment">
                            <div className="comment-header">
                              <img
                                src={comment.creator.avatar || "/icons/placeholder.svg"}
                                alt={comment.creator.name}
                                className="user-avatar-small"
                              />
                              <div className="comment-info">
                                <span className="comment-creator">{comment.creator.name}</span>
                                <span className="comment-date">
                                  {new Date(comment.createdAt || Date.now()).toLocaleString()}
                                </span>
                              </div>
                            </div>
                            <div className="comment-content">{comment.content}</div>
                          </div>
                        ))}

                        <div className="add-comment">
                          <input type="text" placeholder="Write a comment..." className="comment-input" />
                          <button className="post-comment-button">Post</button>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {/* Events Tab */}
          {activeTab === "events" && (
            <div className="group-events">
              {group.events.length === 0 ? (
                <div className="no-content">No events yet. Create one!</div>
              ) : (
                group.events.map((event) => (
                  <div key={event.id} className="event-card">
                    <div className="event-header">
                      <h3 className="event-title">{event.title}</h3>
                      <div className="event-creator">Created by {event.creator.name}</div>
                    </div>

                    <div className="event-details">
                      <div className="event-date">
                        <strong>When:</strong> {new Date(event.date).toLocaleString()}
                      </div>
                      {event.location && (
                        <div className="event-location">
                          <strong>Where:</strong> {event.location}
                        </div>
                      )}
                      <div className="event-description">{event.description}</div>
                    </div>

                    <div className="event-responses">
                      <div className="response-count">
                        <span>{event.responses.going.length} Going</span>
                        <span>{event.responses.notGoing.length} Not Going</span>
                      </div>

                      <div className="response-actions">
                        <button
                          className={`response-button ${event.responses.going.some((u) => u.id === 1) ? "active" : ""}`}
                          onClick={() => handleEventResponse(event.id, true)}
                        >
                          Going
                        </button>
                        <button
                          className={`response-button ${event.responses.notGoing.some((u) => u.id === 1) ? "active" : ""}`}
                          onClick={() => handleEventResponse(event.id, false)}
                        >
                          Not Going
                        </button>
                      </div>
                    </div>

                    <div className="event-attendees">
                      <div className="attendees-section">
                        <h4>Going ({event.responses.going.length})</h4>
                        <div className="attendees-list">
                          {event.responses.going.map((user) => (
                            <div key={user.id} className="attendee">
                              <img
                                src={user.avatar || "/icons/placeholder.svg"}
                                alt={user.name}
                                className="user-avatar-small"
                              />
                              <span>{user.name}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {event.responses.notGoing.length > 0 && (
                        <div className="attendees-section">
                          <h4>Not Going ({event.responses.notGoing.length})</h4>
                          <div className="attendees-list">
                            {event.responses.notGoing.map((user) => (
                              <div key={user.id} className="attendee">
                                <img
                                  src={user.avatar || "/icons/placeholder.svg"}
                                  alt={user.name}
                                  className="user-avatar-small"
                                />
                                <span>{user.name}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </>
      )}

      {/* Members Modal */}
      {showMembersModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Group Members</h2>
            <div className="members-list">
              {group.members.map((member) => (
                <div key={member.id} className="member-item">
                  <div className="member-info">
                    <img src={member.avatar || "/icons/placeholder.svg"} alt={member.name} className="user-avatar" />
                    <div className="member-details">
                      <span className="member-name">{member.name}</span>
                      <span className="member-username">@{member.username}</span>
                    </div>
                  </div>
                  {member.id === group.creator.id && <div className="creator-badge">Creator</div>}
                </div>
              ))}
            </div>
            <div className="modal-actions">
              <button className="close-modal" onClick={() => setShowMembersModal(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Invite User to Group</h2>
            <form onSubmit={handleInviteUser}>
              <div className="form-group">
                <label htmlFor="invite-username">Username</label>
                <input
                  type="text"
                  id="invite-username"
                  value={inviteUsername}
                  onChange={(e) => setInviteUsername(e.target.value)}
                  placeholder="Enter username to invite"
                  required
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="cancel-button" onClick={() => setShowInviteModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="submit-button">
                  Send Invitation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Post Modal */}
      {showCreatePostModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Create New Post</h2>
            <form onSubmit={handleCreatePost}>
              <div className="form-group">
                <label htmlFor="post-content">Post Content</label>
                <textarea
                  id="post-content"
                  value={newPost}
                  onChange={(e) => setNewPost(e.target.value)}
                  placeholder="What's on your mind?"
                  rows={6}
                  required
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="cancel-button" onClick={() => setShowCreatePostModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="submit-button">
                  Post
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Event Modal */}
      {showCreateEventModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Create New Event</h2>
            <form onSubmit={handleCreateEvent}>
              <div className="form-group">
                <label htmlFor="event-title">Title</label>
                <input
                  type="text"
                  id="event-title"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  placeholder="Event title"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="event-description">Description</label>
                <textarea
                  id="event-description"
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                  placeholder="Describe the event"
                  rows={4}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="event-date">Date & Time</label>
                <input
                  type="datetime-local"
                  id="event-date"
                  value={newEvent.date}
                  onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="event-location">Location (optional)</label>
                <input
                  type="text"
                  id="event-location"
                  value={newEvent.location}
                  onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                  placeholder="Where will the event take place?"
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="cancel-button" onClick={() => setShowCreateEventModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="submit-button">
                  Create Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
