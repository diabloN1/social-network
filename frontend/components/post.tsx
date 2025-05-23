"use client";

import type React from "react";
import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import reactToPost from "@/api/posts/reactToPost";
// import addComment from "@/api/posts/addComment";

interface Comment {
  id: number;
  user: {
    name: string;
    avatar: string;
  };
  text: string;
  timestamp: string;
}

interface ReactionCounts {
  likes: number;
  dislikes: number;
  user_reaction: boolean | null;
}

interface PostProps {
  post: {
    id: number;
    user_id?: number;
    user: {
      firstname: string;
      lastname: string;
      avatar: string;
    };
    image?: string;
    caption: string;
    privacy: string;
    comments?: Comment[];
    timestamp?: string;
    creation_date?: string;
    reactions?: ReactionCounts;
  };
  onReactionUpdate?: (postId: number, reactionData: ReactionCounts) => void;
}

const Post: React.FC<PostProps> = ({ post, onReactionUpdate }) => {
  // Initialize reactions state from post data
  const [reactions, setReactions] = useState({
    likes: post.reactions?.likes || 0,
    dislikes: post.reactions?.dislikes || 0,
    userReaction: post.reactions?.user_reaction,
  });
  const [isReacting, setIsReacting] = useState(false);
  const [comments, setComments] = useState<Comment[]>(post.comments || []);
  const [newComment, setNewComment] = useState("");
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const router = useRouter();

  // Debug the initial reaction state
  useEffect(() => {
    console.log(`Post ${post.id} initial reaction state:`, {
      likes: post.reactions?.likes,
      dislikes: post.reactions?.dislikes,
      userReaction: post.reactions?.user_reaction,
    });
  }, [post.id, post.reactions]);

  // Update local state when post prop changes
  useEffect(() => {
    if (post.reactions) {
      // Make sure we're using the correct field name for user reaction
      const userReaction =
        post.reactions.user_reaction !== undefined
          ? post.reactions.user_reaction
          : null;

      console.log(`Post ${post.id} updating reaction state:`, {
        likes: post.reactions.likes || 0,
        dislikes: post.reactions.dislikes || 0,
        userReaction: userReaction,
      });

      setReactions({
        likes: post.reactions.likes || 0,
        dislikes: post.reactions.dislikes || 0,
        userReaction: userReaction,
      });
    }
  }, [post.reactions]);

  const navigateToPost = () => {
    router.push(`/app/${post.id}`);
  };

  const handleReaction = async (reaction: boolean) => {
    if (isReacting) return;
    setIsReacting(true);

    // If user clicked the same reaction they already have, we'll toggle it off (null)
    const newReaction = reactions.userReaction === reaction ? null : reaction;
    console.log(`Reacting to post ${post.id}:`, {
      currentReaction: reactions.userReaction,
      newReaction,
    });

    // Optimistic UI update
    setReactions((prev) => ({
      likes:
        prev.likes + (reaction === true ? (newReaction === null ? -1 : 1) : 0),
      dislikes:
        prev.dislikes +
        (reaction === false ? (newReaction === null ? -1 : 1) : 0),
      userReaction: newReaction,
    }));

    try {
      const data = await reactToPost(post.id, newReaction);
      console.log(`Reaction response for post ${post.id}:`, data);

      if (data.error) {
        console.error("Error reacting to post:", data.error);
        // Revert optimistic update on error
        setReactions({
          likes: post.reactions?.likes || 0,
          dislikes: post.reactions?.dislikes || 0,
          userReaction: post.reactions?.user_reaction,
        });
        return;
      }

      if (data.posts && data.posts.length > 0 && data.posts[0].reactions) {
        const updatedReactions = data.posts[0].reactions;
        console.log(`Updated reactions for post ${post.id}:`, updatedReactions);

        setReactions({
          likes: updatedReactions.likes,
          dislikes: updatedReactions.dislikes,
          userReaction: updatedReactions.user_reaction,
        });

        // Notify parent component about the reaction update
        if (onReactionUpdate) {
          onReactionUpdate(post.id, updatedReactions);
        }
      }
    } catch (error) {
      console.error("Failed to react to post:", error);
      // Revert optimistic update on error
      setReactions({
        likes: post.reactions?.likes || 0,
        dislikes: post.reactions?.dislikes || 0,
        userReaction: post.reactions?.user_reaction,
      });
    } finally {
      setIsReacting(false);
    }
  };

  // Replace the loadComments function with this:
  const handleCommentClick = () => {
    router.push(`/app/${post.id}`);
  };

  const renderPrivacyIcon = () => {
    switch (post.privacy) {
      case "public":
        return (
          <Image src="/icons/globe.svg" alt="globe" width={18} height={18} />
        );
      case "almost-private":
        return (
          <Image src="/icons/users.svg" alt="users" width={18} height={18} />
        );
      case "private":
        return (
          <Image src="/icons/lock.svg" alt="lock" width={18} height={18} />
        );
      default:
        return (
          <Image src="/icons/users.svg" alt="users" width={18} height={18} />
        );
    }
  };

  return (
    <article className="post">
      <div className="post-header">
        <div
          className="post-user-avatar"
          onClick={() => router.push(`/app/profiles/${post.user_id}`)}
        >
          <img
            src={
              post.user.avatar
                ? `http://localhost:8080/getProtectedImage?type=avatars&id=${
                    post.user_id
                  }&path=${encodeURIComponent(post.user.avatar)}`
                : "/icons/placeholder.svg"
            }
            alt="user avatar"
            className="post-image"
          />
        </div>
        <div
          className="post-user-name"
          onClick={() => router.push(`/app/profiles/${post.user_id}`)}
        >
          {post.user.firstname + " " + post.user.lastname}
        </div>
        <div className="post-privacy">
          {renderPrivacyIcon()}
          {post.privacy === "public"
            ? "Public"
            : post.privacy === "almost-private"
            ? "Followers"
            : "Private"}
        </div>
      </div>

      {/* Add to the post-image-container div to make it clickable: */}
      {post.image && (
        <div
          className="post-image-container"
          onClick={navigateToPost}
          style={{ cursor: "pointer" }}
        >
          <img
            src={
              post.image
                ? `http://localhost:8080/getProtectedImage?type=posts&id=${
                    post.id
                  }&path=${encodeURIComponent(post.image)}`
                : "/icons/placeholder.svg"
            }
            alt="Post content"
            className="post-image"
          />
        </div>
      )}

      <div className="post-actions">
        <button
          className="post-action-btn"
          onClick={() => handleReaction(true)}
          disabled={isReacting}
          aria-label="Like"
          title={reactions.userReaction === true ? "Unlike" : "Like"}
        >
          {reactions.userReaction === true ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="var(--primary-color)"
              stroke="var(--primary-color)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="reaction-icon"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="reaction-icon"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
          )}
        </button>
        <button
          className="post-action-btn"
          onClick={() => handleReaction(false)}
          disabled={isReacting}
          aria-label="Dislike"
          title={
            reactions.userReaction === false ? "Remove dislike" : "Dislike"
          }
        >
          {reactions.userReaction === false ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="var(--primary-color)"
              stroke="var(--primary-color)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="reaction-icon"
            >
              <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17"></path>
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="reaction-icon"
            >
              <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17"></path>
            </svg>
          )}
        </button>
        <button
          className="post-action-btn"
          onClick={handleCommentClick}
          title="View comments"
        >
          <Image
            src="/icons/messages.svg"
            alt="messages"
            width={24}
            height={24}
          />
          {comments.length > 0 && (
            <span className="comment-count">{comments.length}</span>
          )}
        </button>
        <button className="post-action-btn">
          <Image src="/icons/send.svg" alt="send" width={24} height={24} />
        </button>
      </div>

      <div className="post-likes">
        {reactions.likes} likes • {reactions.dislikes} dislikes
      </div>

      <div className="post-caption">
        <span className="post-user-name">
          {post.user.firstname + " " + post.user.lastname}
        </span>{" "}
        {post.caption}
      </div>

      <div className="post-timestamp">
        {post.creation_date || post.timestamp || "Just now"}
      </div>
    </article>
  );
};

export default Post;
