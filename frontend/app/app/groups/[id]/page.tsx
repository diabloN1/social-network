"use client";

import type React from "react";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import getGroupData from "@/api/groups/getGroupData";
import reactToGroupPost from "@/api/groups/reactToGroupPost";
import getGroupComments from "@/api/groups/getGroupComments";
import GroupCommentForm from "@/components/group-comment-form";
import GroupComment from "@/components/group-comment";
import CreatePostModal from "@/components/create-post-modal";
import CreateEventModal from "@/components/create-event-modal";
import GroupInviteModal from "@/components/group-invite-modal";
import addGroupPost from "@/api/groups/addGroupPost";
import addGroupEvent from "@/api/groups/addGroupEvent";
import addEventOption from "@/api/groups/addEventOption";
import requestJoinGroup from "@/api/groups/requestJoinGroup";
import "./group.css";
import { Group } from "@/types/group";
import { Post, Reaction } from "@/types/post";
import { Comment } from "@/types/comment";
import Popup from "../../popup";

export default function GroupDetailPage() {
  const params = useParams();
  const router = useRouter();
  const groupId = Number(params.id);

  const [group, setGroup] = useState<Group | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("posts");

  // Modal states
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showCreatePostModal, setShowCreatePostModal] = useState(false);
  const [showCreateEventModal, setShowCreateEventModal] = useState(false);
  const [popup, setPopup] = useState<{
    message: string;
    status: "success" | "failure";
  } | null>(null);

  // Reaction and comment states
  const [postReactions, setPostReactions] = useState<{ [key: number]: Reaction }>(
    {}
  );
  const [postComments, setPostComments] = useState<{ [key: number]: Comment[] }>(
    {}
  );
  const [expandedComments, setExpandedComments] = useState<{
    [key: number]: boolean;
  }>({});

  const fetchGroupData = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await getGroupData(groupId);

      if (data.error) {
        setError(data.error);
        return;
      }

      setGroup(data.group);

      // Initialize reactions for each post
      if (data.group?.posts) {
        const reactions: { [key: number]: Reaction } = {};
        data.group.posts.forEach((post: Post) => {
          reactions[post.id] = {
            likes: post.reactions?.likes || 0,
            dislikes: post.reactions?.dislikes || 0,
            userReaction: post.reactions?.userReaction || null,
            isReacting: false,
          };
        });
        setPostReactions(reactions);
      }
    } catch (err) {
      setError("Failed to load group data" + err);
    } finally {
      setIsLoading(false);
    }
  }, [groupId])

  useEffect(() => {
    fetchGroupData();
  }, [groupId, fetchGroupData]);

  // Reaction handling
  const handleReaction = async (postId: number, reaction: boolean) => {
    const currentReaction = postReactions[postId];
    if (currentReaction?.isReacting) return;

    setPostReactions((prev) => ({
      ...prev,
      [postId]: { ...prev[postId], isReacting: true },
    }));

    const newReaction =
      currentReaction?.userReaction === reaction ? null : reaction;
    // Optimistic UI update
    setPostReactions((prev) => {
      const current = prev[postId];
      let newLikes = current.likes;
      let newDislikes = current.dislikes;

      if (current.userReaction === true && newReaction === null) {
        newLikes--;
      } else if (current.userReaction !== true && newReaction === true) {
        newLikes++;
        if (current.userReaction === false) {
          newDislikes--;
        }
      } else if (current.userReaction === false && newReaction === null) {
        newDislikes--;
      } else if (current.userReaction !== false && newReaction === false) {
        newDislikes++;
        if (current.userReaction === true) {
          newLikes--;
        }
      }

      return {
        ...prev,
        [postId]: {
          likes: newLikes,
          dislikes: newDislikes,
          userReaction: newReaction,
          isReacting: true,
        },
      };
    });

    try {
      const data = await reactToGroupPost(postId, newReaction);

      if (data.error) {
        console.error("Error reacting to group post:", data.error);
        setPostReactions((prev) => ({
          ...prev,
          [postId]: { ...currentReaction, isReacting: false },
        }));
        return;
      }

      if (data.posts && data.posts.length > 0 && data.posts[0].reactions) {
        const updatedReactions = data.posts[0].reactions;
        setPostReactions((prev) => ({
          ...prev,
          [postId]: {
            likes: updatedReactions.likes,
            dislikes: updatedReactions.dislikes,
            userReaction: updatedReactions.user_reaction,
            isReacting: false,
          },
        }));
      }
    } catch (error) {
      setPopup({ message: `${error}`, status: "failure" });
      setPostReactions((prev) => ({
        ...prev,
        [postId]: { ...currentReaction, isReacting: false },
      }));
    }
  };

  // Comment handling
  const loadComments = async (postId: number) => {
    try {
      const commentsData = await getGroupComments(postId);
      if (commentsData.error) {
        throw new Error(commentsData.error);
      }

      if (
        commentsData.posts &&
        commentsData.posts[0] &&
        commentsData.posts[0].comments
      ) {
        setPostComments((prev) => ({
          ...prev,
          [postId]: commentsData.posts[0].comments,
        }));
      }
    } catch (error) {
      setPopup({ message: `${error}`, status: "failure" });
    }
  };

  const toggleComments = async (postId: number) => {
    if (expandedComments[postId]) {
      setExpandedComments((prev) => ({
        ...prev,
        [postId]: false,
      }));
    } else {
      setExpandedComments((prev) => ({
        ...prev,
        [postId]: true,
      }));

      if (!postComments[postId]) {
        await loadComments(postId);
      }
    }
  };

  const handleCommentAdded = (postId: number) => {
    loadComments(postId);
  };

  // Post creation
  const handleCreatePost = async (postData: {
    image: string;
    caption: string;
    groupId?: number;
  }) => {
    try {
      const data = await addGroupPost(postData);
      if (data.error) {
        setPopup({ message: `${error}`, status: "failure" });
        return;
      }

      setShowCreatePostModal(false);
      fetchGroupData();
    } catch (error) {
      setPopup({ message: `${error}`, status: "failure" });
    }
  };

  // Event creation
  const handleCreateEvent = async (event: {
    title: string;
    description: string;
    option1: string;
    option2: string;
    date: string;
    place: string;
  }) => {
    try {
      const data = await addGroupEvent({
        groupId,
        ...event,
      });
      if (data.error) {
        alert(data.error);
        return;
      }

      setShowCreateEventModal(false);
      fetchGroupData();
    } catch (error) {
      setPopup({ message: `${error}`, status: "failure" });
    }
  };

  // Event response
  const handleEventResponse = async (eventId: number, going: boolean) => {
    if (!group) return;
    try {
      const data = await addEventOption(groupId, eventId, going);
      console.log(data);
      fetchGroupData();
    } catch (error) {
      setPopup({ message: `${error}`, status: "failure" });
    }
  };

  // Join group
  const handleJoinGroup = async () => {
    try {
      const data = await requestJoinGroup(groupId);
      if (data.error) {
        setPopup({ message: data.error, status: "failure" });
        return;
      }
      fetchGroupData();
    } catch (error) {
      setPopup({ message: `${error}`, status: "failure" });
    }
  };

  // Handle invitation sent callback
  const handleInvitationSent = () => {
    console.log("Invitation sent successfully");
    // Optionally refresh group data or show success message
  };

  if (isLoading) {
    return (
      <div className="group-detail-container">
        <div className="loading">Loading group...</div>
      </div>
    );
  }

  if (error || !group) {
    return (
      <div className="group-detail-container">
        <div className="error">{error || "Group not found"}</div>
        <button onClick={() => router.back()} className="back-button">
          Go Back
        </button>
      </div>
    );
  }

  // Get the owner from members array
  // const owner = group.members?.find((member) => member.id === group.owner_id);
  // const ownerName = owner ? `${owner.firstname} ${owner.lastname}` : "Unknown";

  if (!group.is_accepted && !group.is_owner) {
    return (
      <div className="group-detail-container">
        <button onClick={() => router.back()} className="back-button">
          <Image src="/icons/left.svg" alt="back" width={16} height={16} />
          <span>Back</span>
        </button>

        <div className="group-header">
          <div className="group-image">
            <Image
              src={
                group.image
                  ? `http://localhost:8080/getProtectedImage?type=avatars&id=0&path=${encodeURIComponent(
                      group.image
                    )}`
                  : "/icons/placeholder.svg"
              }
              alt="user avatar"
              width={40}
              height={40}
              unoptimized
            />
          </div>
          <div className="group-info">
            <h1>{group.title}</h1>
            <p>{group.description}</p>
            <div className="group-stats">
              <span>{group.members?.length || 0} members</span>
            </div>
          </div>
        </div>

        <div className="non-member-view">
          <div className="join-message">
            <h3>This is a private group</h3>
            <p>
              Join this group to see posts, events, and interact with members.
            </p>
            {!group.is_pending ? (
              <button className="join-button" onClick={handleJoinGroup}>
                Request to Join
              </button>
            ) : (
              <div className="request-pending-message">
                Your join request is pending approval
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="group-detail-container">
      <button onClick={() => router.back()} className="back-button">
        <Image src="/icons/left.svg" alt="back" width={16} height={16} />
        <span>Back</span>
      </button>

      {/* Group Header */}
      <div className="group-header">
        <div className="group-image">
          <Image
            src={
              group.image
                ? `http://localhost:8080/getProtectedImage?type=avatars&id=0&path=${encodeURIComponent(
                    group.image
                  )}`
                : "/icons/placeholder.svg"
            }
            alt="user avatar"
            width={800}
            height={400}
            unoptimized
          />
        </div>
        <div className="group-info">
          <h1>{group.title}</h1>
          <p>{group.description}</p>
          <div className="group-stats">
            <span>{group.members?.length || 0} members</span>
            <span>{group.posts?.length || 0} posts</span>
          </div>
        </div>
      </div>

      {/* Group Actions */}
      {group.is_accepted && (
        <div className="group-actions">
          <button
            className="action-button"
            onClick={() => setShowCreatePostModal(true)}
          >
            Create Post
          </button>
          <button
            className="action-button"
            onClick={() => setShowCreateEventModal(true)}
          >
            Create Event
          </button>
          <button
            className="action-button"
            onClick={() => setShowInviteModal(true)}
          >
            Invite Users
          </button>
          <button
            className="action-button"
            onClick={() => setShowMembersModal(true)}
          >
            View Members
          </button>
        </div>
      )}

      {/* Content Tabs */}
      <div className="group-tabs">
        <button
          className={`tab ${activeTab === "posts" ? "active" : ""}`}
          onClick={() => setActiveTab("posts")}
        >
          Posts
        </button>
        <button
          className={`tab ${activeTab === "events" ? "active" : ""}`}
          onClick={() => setActiveTab("events")}
        >
          Events
        </button>
      </div>

      {/* Posts Tab */}
      {activeTab === "posts" && (
        <div className="group-posts">
          {group.posts && group.posts.length > 0 ? (
            group.posts.map((post) => (
              <div key={post.id} className="group-post">
                <div className="post-header">
                  <div className="post-user">
                    <Image
                      src={
                        post.user.avatar
                          ? `http://localhost:8080/getProtectedImage?type=avatars&id=0&path=${encodeURIComponent(
                              post.user.avatar
                            )}`
                          : "/icons/placeholder.svg"
                      }
                      alt="user avatar"
                      width={40}
                      height={40}
                      unoptimized
                    />
                    <div className="post-user-info">
                      <span className="post-user-name">
                        {post.user?.firstname} {post.user?.lastname}
                      </span>
                      <span className="post-timestamp">
                        {post.creation_date
                          ? new Date(post.creation_date).toLocaleString()
                          : "Unknown date"}
                      </span>
                    </div>
                  </div>
                </div>

                {post.caption && (
                  <div className="post-caption">{post.caption}</div>
                )}

                {post.image && (
                  <div className="post-image">
                    <Image
                      src={`http://localhost:8080/getProtectedImage?type=group-posts&id=${groupId}&path=${encodeURIComponent(
                        post.image
                      )}`}
                      alt="Post image"
                      width={400}
                      height={200}
                      unoptimized
                    />
                  </div>
                )}

                <div className="post-actions">
                  <div className="reaction-buttons">
                    <button
                      className={`reaction-btn ${
                        postReactions[post.id]?.userReaction === true
                          ? "active"
                          : ""
                      }`}
                      onClick={() => handleReaction(post.id, true)}
                      disabled={postReactions[post.id]?.isReacting}
                    >
                      {postReactions[post.id]?.userReaction === true ? (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="var(--primary-color)"
                          stroke="var(--primary-color)"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                        </svg>
                      ) : (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                        </svg>
                      )}
                      <span>{postReactions[post.id]?.likes || 0}</span>
                    </button>

                    <button
                      className={`reaction-btn ${
                        postReactions[post.id]?.userReaction === false
                          ? "active"
                          : ""
                      }`}
                      onClick={() => handleReaction(post.id, false)}
                      disabled={postReactions[post.id]?.isReacting}
                    >
                      {postReactions[post.id]?.userReaction === false ? (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="var(--primary-color)"
                          stroke="var(--primary-color)"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17"></path>
                        </svg>
                      ) : (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17"></path>
                        </svg>
                      )}
                      <span>{postReactions[post.id]?.dislikes || 0}</span>
                    </button>

                    <button
                      className="comment-btn"
                      onClick={() => toggleComments(post.id)}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                      </svg>
                      <span>Comments</span>
                    </button>
                  </div>
                </div>

                {expandedComments[post.id] && (
                  <div className="post-comments-section">
                    <div className="comments-list">
                      {postComments[post.id] &&
                      postComments[post.id].length > 0 ? (
                        postComments[post.id].map((comment) => (
                          <GroupComment
                            key={comment.id}
                            comment={comment}
                            postID={post.id}
                          />
                        ))
                      ) : (
                        <div className="no-comments">No comments yet</div>
                      )}
                    </div>

                    <GroupCommentForm
                      postId={post.id}
                      onCommentAdded={() => handleCommentAdded(post.id)}
                    />
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="no-posts">No posts yet. Be the first to post!</div>
          )}
        </div>
      )}

      {/* Events Tab */}
      {activeTab === "events" && (
        <div className="group-events">
          {group.events && group.events.length > 0 ? (
            group.events.map((event) => (
              <div key={event.id} className="event-card">
                <div className="event-header">
                  <h3 className="event-title">{event.title}</h3>
                  <div className="event-creator">
                    Created by{" "}
                    {`${event.user.firstname} ${event.user.lastname}`}
                  </div>
                </div>

                <div className="event-details">
                  <div className="event-date">
                    <strong>When:</strong>{" "}
                    {new Date(event.date).toLocaleString()}
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
                      className={`response-button ${
                        event.current_option === "option1" ? "active" : ""
                      }`}
                      onClick={() => handleEventResponse(event.id, true)}
                    >
                      {event.option_1}
                    </button>
                    <button
                      className={`response-button ${
                        event.current_option === "option2" ? "active" : ""
                      }`}
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
                            <Image
                              src={
                                user.avatar
                                  ? `http://localhost:8080/getProtectedImage?type=avatars&id=0&path=${encodeURIComponent(
                                      user.avatar
                                    )}`
                                  : "/icons/placeholder.svg"
                              }
                              alt="user avatar"
                              width={40}
                              height={40}
                              unoptimized
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
                            <Image
                              src={
                                user.avatar
                                  ? `http://localhost:8080/getProtectedImage?type=avatars&id=0&path=${encodeURIComponent(
                                      user.avatar
                                    )}`
                                  : "/icons/placeholder.svg"
                              }
                              alt="user avatar"
                              width={40}
                              height={40}
                              unoptimized
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
          ) : (
            <div className="no-content">No events yet. Create one!</div>
          )}
        </div>
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
                    <Image
                      src={
                        member.avatar
                          ? `http://localhost:8080/getProtectedImage?type=avatars&id=0&path=${encodeURIComponent(
                              member.avatar
                            )}`
                          : "/icons/placeholder.svg"
                      }
                      alt="user avatar"
                      width={40}
                      height={40}
                      unoptimized
                    />

                    <div className="member-details">
                      <span className="member-name">{`${member.firstname} ${member.lastname}`}</span>
                      <span className="member-nickname">
                        <br />@{member.nickname || member.username}
                      </span>
                    </div>
                  </div>
                  {member.id === group.owner_id && (
                    <div className="creator-badge">Creator</div>
                  )}
                </div>
              ))}
            </div>
            <div className="modal-actions">
              <button
                className="close-modal"
                onClick={() => setShowMembersModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Invite Modal */}
      {showInviteModal && (
        <GroupInviteModal
          groupId={groupId}
          isOpen={showInviteModal}
          onClose={() => setShowInviteModal(false)}
          onInviteSent={handleInvitationSent}
        />
      )}

      {/* Create Post Modal */}
      {showCreatePostModal && (
        <CreatePostModal
          onClose={() => setShowCreatePostModal(false)}
          onSubmit={handleCreatePost}
          groupId={groupId}
        />
      )}

      {/* Create Event Modal */}
      {showCreateEventModal && (
        <CreateEventModal
          onClose={() => setShowCreateEventModal(false)}
          onSubmit={handleCreateEvent}
        />
      )}
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
