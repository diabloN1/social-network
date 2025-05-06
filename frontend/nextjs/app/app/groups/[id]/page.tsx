"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import "./group.css"
import getGroupData from "@/app/api/_groups/getGroupData"
import CreatePostModal from "@/app/_components/create-post-modal"
import addGroupPost from "@/app/api/_groups/addGroupPost"
import CreateEventModal from "@/app/_components/create-event-modal"
import addGroupEvent from "@/app/api/_groups/addGroupEvent"
import addEventOption from "@/app/api/_groups/addEventOption"
import requestJoinGroup from "@/app/api/_groups/requestJoinGroup"

// Types for API response
interface User {
  id: number
  username: string
  firstname: string
  lastname: string
  nickname: string
  avatar?: string
}

interface Post {
  id: number
  user: User
  image?: string
  caption?: string
  creation_date?: string
  likes?: number
  comments?: number
}

// Updated Event interface to include the new fields
interface Event {
  id: number
  title: string
  description: string
  user_id: number
  group_id: number
  date: string
  place: string
  option_1: string
  option_2: string
  creation_date: string
  user: User
  current_option?: string
  opt1_users?: User[] | null
  opt2_users?: User[] | null
}

interface GroupData {
  id: number
  title: string
  description: string
  owner_id: number
  image: string
  creation_date: string
  is_accepted: boolean
  is_owner: boolean
  members: User[]
  posts: Post[]
  events: Event[]
}

// Mock function to get post comments
const getMockComments = (postId: number): any[] => {
  return [
    {
      id: 1,
      content: "I've been thinking about getting one too! How's the battery life?",
      creator: {
        id: 2,
        nickname: "jane_smith",
        name: "Jane Smith",
        avatar: "/icons/placeholder.svg",
      },
    },
    {
      id: 2,
      content: "Great tip! I always carry a polarizing filter with me. Makes a huge difference.",
      creator: {
        id: 7,
        nickname: "david_miller",
        name: "David Miller",
        avatar: "/icons/placeholder.svg",
      },
    },
    {
      id: 3,
      content: "Has anyone tried astrophotography with their DSLR?",
      creator: {
        id: 1,
        nickname: "john_doe",
        name: "John Doe",
        avatar: "/icons/placeholder.svg",
      },
    },
  ]
}

export default function GroupPage() {
  const params = useParams()
  const router = useRouter()
  const groupId = Number.parseInt(params.id as string, 10)

  const [group, setGroup] = useState<GroupData | null>(null)
  const [activeTab, setActiveTab] = useState("posts")
  const [showMembersModal, setShowMembersModal] = useState(false)
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [showCreatePostModal, setShowCreatePostModal] = useState(false)
  const [showCreateEventModal, setShowCreateEventModal] = useState(false)
  const [showComments, setShowComments] = useState<Record<number, boolean>>({})

  const [loading, setLoading] = useState(true)
  const [inviteUsername, setInviteUsername] = useState("")

  const fetchGroupData = async () => {
    setLoading(true)
    try {
      const data = await getGroupData(groupId)
      console.log(data)
      setGroup(data.group)
    } catch (error) {
      console.error("Error fetching group data:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
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
  const handleCreatePost = async (group: { image: string; caption: string; groupId?: number }) => {
    try {
      const data = await addGroupPost(group)
      if (data.error) {
        alert(data.error)
        return
      }

      setShowCreatePostModal(false)
      // Refresh group data to show the new post
      fetchGroupData()
    } catch (error) {
      alert(error)
    }
  }

  // Handle creating a new event
  const handleCreateEvent = async (event: {
    title: string
    description: string
    option1: string
    option2: string
    date: string
    place: string
  }) => {
    try {
      const data = await addGroupEvent({
        groupId,
        ...event,
      })
      if (data.error) {
        alert(data.error)
        return
      }

      setShowCreateEventModal(false)
      // Refresh group data to show the new event
      fetchGroupData()
    } catch (error) {
      alert(error)
    }
  }

  // Handle responding to an event
  const handleEventResponse = async (eventId: number, going: boolean) => {
    if (!group) return
    try {
      const data = await addEventOption(groupId, eventId, going)
      console.log(data)
      
      // Refresh group data to update event responses
      fetchGroupData()
    } catch (error) {
      alert(error)
    }
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

  // Handle joining a group
  const handleJoinGroup = async () => {
    try {
      const data = await requestJoinGroup(groupId)
      if (data.error) {
        alert(data.error)
        return
      }
      console.log("request Sended succesfuly")
    } catch(error) {
      alert(error)
    }
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

  // Get the owner from members array
  const owner = group.members?.find((member) => member.id === group.owner_id)
  const ownerName = owner ? `${owner.firstname} ${owner.lastname}` : "Unknown"

  return (
    <div className="group-container">
      <button className="back-button" onClick={goBack}>
        ← Back to Groups
      </button>

      <div className="group-header">
        <div className="group-image">
          <img src={group.image || "/icons/placeholder.svg"} alt={group.title} />
        </div>
        <div className="group-title-section">
          <h1>{group.title}</h1>
          <p className="group-description">{group.description}</p>
        </div>

        <div className="group-actions">
          {group.is_accepted && (
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
          {!group.is_accepted && (
            <button className="action-button" onClick={() => handleJoinGroup()}>
              Request to Join
            </button>
          )}
        </div>

        <div className="group-meta">
          <div className="group-members-preview" onClick={() => setShowMembersModal(true)}>
            <span>Members ({group.members?.length})</span>
            <div className="members-avatars">
              {group.members?.slice(0, 3).map((member) => (
                <img  
                  key={member.id}
                  src={member.avatar || "/icons/placeholder.svg"}
                  alt={`${member.firstname} ${member.lastname}`}
                  className="member-avatar"
                  title={`${member.firstname} ${member.lastname}`}
                />
              ))}
              {group.members?.length > 3 && <span className="more-members">+{group.members?.length - 3}</span>}
            </div>
          </div>

          <div className="group-creator">
            <span>Created by {ownerName}</span>
          </div>
        </div>
      </div>

      {!group.is_accepted ? (
        <div className="non-member-view">
          <div className="join-message">
            <h3>This is a private group</h3>
            <p>Join this group to see posts, events, and interact with members.</p>
            <button className="join-button" onClick={() => handleJoinGroup()}>
              Request to Join
            </button>
          </div>
        </div>
      ) : (
        <>
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
              {group.posts?.length === 0 ? (
                <div className="no-content">No posts yet. Be the first to post!</div>
              ) : (
                group.posts?.map((post) => {
                  const postAuthor = post.user

                  return (
                    <div key={post.id} className="post-card">
                      <div className="post-header">
                        <div className="post-creator">
                          <img
                            src={postAuthor.avatar || "/icons/placeholder.svg"}
                            alt={`${postAuthor.firstname} ${postAuthor.lastname}`}
                            className="user-avatar"
                          />
                          <div className="creator-info">
                            <span className="creator-name">{`${postAuthor.firstname} ${postAuthor.lastname}`}</span>
                            <span className="post-date">
                              {post.creation_date ? new Date(post.creation_date).toLocaleString() : "Unknown date"}
                            </span>
                          </div>
                        </div>
                      </div>
                      {post.image && (
                        <img
                          src={post.image || "/placeholder.svg"}
                          alt={post.caption || "Post image"}
                          className="post-image"
                        />
                      )}
                      <div className="post-content">{post.caption}</div>

                      <div className="post-actions">
                        <button className="post-action">Like ({post.likes || 0})</button>
                        <button className="post-action" onClick={() => toggleComments(post.id)}>
                          Comments ({post.comments || 0})
                        </button>
                      </div>

                      {showComments[post.id] && (
                        <div className="post-comments">
                          {getMockComments(post.id).map((comment) => (
                            <div key={comment.id} className="comment">
                              <div className="comment-header">
                                <img
                                  src={comment.creator.avatar || "/icons/placeholder.svg" || "/placeholder.svg"}
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
                  )
                })
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
                      <div className="event-creator">Created by {`${event.user.firstname} ${event.user.lastname}`}</div>
                    </div>

                    <div className="event-details">
                      <div className="event-date">
                        <strong>When:</strong> {new Date(event.date).toLocaleString()}
                      </div>
                      {event.place && (
                        <div className="event-location">
                          <strong>Where:</strong> {event.place}
                        </div>
                      )}
                      <div className="event-description">{event.description}</div>
                      <div className="event-options">
                        <div>
                          <strong>Option 1:</strong> {event.option_1}
                        </div>
                        <div>
                          <strong>Option 2:</strong> {event.option_2}
                        </div>
                      </div>
                    </div>

                    <div className="event-responses">
                      {/* Display counts of users who selected each option */}
                      <div className="response-count">
                        <span>
                          {event.opt1_users?.length || 0} chose {event.option_1}
                        </span>
                        <span>
                          {event.opt2_users?.length || 0} chose {event.option_2}
                        </span>
                      </div>

                      <div className="response-actions">
                        <button
                          className={`response-button ${event.current_option === "option1" ? "active" : ""}`}
                          onClick={() => handleEventResponse(event.id, true)}
                        >
                          {event.option_1}
                        </button>
                        <button
                          className={`response-button ${event.current_option === "option2" ? "active" : ""}`}
                          onClick={() => handleEventResponse(event.id, false)}
                        >
                          {event.option_2}
                        </button>
                      </div>
                    </div>

                    {/* Display users who selected each option */}
                    <div className="event-attendees">
                      {event.opt1_users && event.opt1_users.length > 0 && (
                        <div className="attendees-section">
                          <h4>
                            Chose {event.option_1} ({event.opt1_users.length})
                          </h4>
                          <div className="attendees-list">
                            {event.opt1_users.map((user) => (
                              <div key={user.id} className="attendee">
                                <img
                                  src={user.avatar || "/icons/placeholder.svg"}
                                  alt={`${user.firstname} ${user.lastname}`}
                                  className="user-avatar-small"
                                />
                                <span>{`${user.firstname} ${user.lastname}`}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {event.opt2_users && event.opt2_users.length > 0 && (
                        <div className="attendees-section">
                          <h4>
                            Chose {event.option_2} ({event.opt2_users.length})
                          </h4>
                          <div className="attendees-list">
                            {event.opt2_users.map((user) => (
                              <div key={user.id} className="attendee">
                                <img
                                  src={user.avatar || "/icons/placeholder.svg"}
                                  alt={`${user.firstname} ${user.lastname}`}
                                  className="user-avatar-small"
                                />
                                <span>{`${user.firstname} ${user.lastname}`}</span>
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
                    <img
                      src={member.avatar || "/icons/placeholder.svg"}
                      alt={`${member.firstname} ${member.lastname}`}
                      className="user-avatar"
                    />
                    <div className="member-details">
                      <span className="member-name">{`${member.firstname} ${member.lastname}`}</span>
                      <span className="member-nickname">@{member.nickname || member.username}</span>
                    </div>
                  </div>
                  {member.id === group.owner_id && <div className="creator-badge">Creator</div>}
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
        <CreatePostModal onClose={() => setShowCreatePostModal(false)} onSubmit={handleCreatePost} groupId={groupId} />
      )}

      {/* Create Event Modal */}
      {showCreateEventModal && (
        <CreateEventModal onClose={() => setShowCreateEventModal(false)} onSubmit={handleCreateEvent} />
      )}
    </div>
  )
}
