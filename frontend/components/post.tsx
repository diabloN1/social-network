"use client";

import type React from "react";
import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
// import reactToPost from "@/api/posts/pass-reactToPost";
import PostShareModal from "./post-share-modal";
import { Post as PostType, Reaction } from "@/types/post";
import { useGlobalAPIHelper } from "@/helpers/GlobalAPIHelper";

interface PostProps {
  post: PostType;
  currentUserId?: number | null;
  onReactionUpdate?: (postId: number, reactionData: Reaction) => void;
}

const Post: React.FC<PostProps> = ({
  post,
  currentUserId,
  onReactionUpdate,
}) => {
  // Initialize reactions state from post data
  const [reactions, setReactions] = useState({
    likes: post.reactions?.likes || 0,
    dislikes: post.reactions?.dislikes || 0,
    userReaction: post.reactions?.userReaction,
  });
  const [isReacting, setIsReacting] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const router = useRouter();
  const { apiCall } = useGlobalAPIHelper();

  // Update local state when post prop changes
  useEffect(() => {
    if (post.reactions) {
      const userReaction =
        post.reactions.userReaction !== undefined
          ? post.reactions.userReaction
          : null;

      setReactions({
        likes: post.reactions.likes || 0,
        dislikes: post.reactions.dislikes || 0,
        userReaction: userReaction,
      });
    }
  }, [post.reactions]);

  const navigateToPost = () => {
    router.push(`/home/${post.id}`);
  };

  const handleReaction = async (reaction: boolean) => {
    if (isReacting) return;
    setIsReacting(true);

    const newReaction = reactions.userReaction === reaction ? null : reaction;

    setReactions((prev) => {
      let newLikes = prev.likes;
      let newDislikes = prev.dislikes;

      if (prev.userReaction === true && newReaction === null) {
        newLikes--;
      } else if (prev.userReaction !== true && newReaction === true) {
        newLikes++;
        if (prev.userReaction === false) {
          newDislikes--;
        }
      } else if (prev.userReaction === false && newReaction === null) {
        newDislikes--;
      } else if (prev.userReaction !== false && newReaction === false) {
        newDislikes++;
        if (prev.userReaction === true) {
          newLikes--;
        }
      }

      return {
        likes: newLikes,
        dislikes: newDislikes,
        userReaction: newReaction,
      };
    });

    try {
      const data = await apiCall(
        {
          type: "react-to-post",
          data: { postId: post.id, reaction: newReaction },
        },
        "POST",
        "reactToPost"
      );

      if (data.error) {
        console.error("Error reacting to post:", data.error);
        setReactions({
          likes: post.reactions?.likes || 0,
          dislikes: post.reactions?.dislikes || 0,
          userReaction: post.reactions?.userReaction,
        });
        return;
      }

      if (data.posts && data.posts.length > 0 && data.posts[0].reactions) {
        const updatedReactions = data.posts[0].reactions;
        setReactions({
          likes: updatedReactions.likes,
          dislikes: updatedReactions.dislikes,
          userReaction: updatedReactions.userReaction,
        });

        if (onReactionUpdate) {
          onReactionUpdate(post.id, updatedReactions);
        }
      }
    } catch (error) {
      console.error("Failed to react to post:", error);
      setReactions({
        likes: post.reactions?.likes || 0,
        dislikes: post.reactions?.dislikes || 0,
        userReaction: post.reactions?.userReaction,
      });
    } finally {
      setIsReacting(false);
    }
  };

  const handleCommentClick = () => {
    router.push(`/home/${post.id}`);
  };

  const handleShareClick = () => {
    setIsShareModalOpen(true);
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

  // Check if current user owns this post and it's private
  const showShareButton =
    post.privacy === "private" && post.user_id === currentUserId;

  // // Debug logging
  // console.log(`Post ${post.id} share button check:`, {
  //   privacy: post.privacy,
  //   postUserId: post.user_id,
  //   currentUserId: currentUserId,
  //   showShareButton: showShareButton,
  // });

  return (
    <>
      <article className="post">
        <div className="post-header">
          <div
            className="post-user-avatar"
            onClick={() => router.push(`/home/profiles/${post.user_id}`)}
          >
            <Image
              src={
                post.user.avatar
                  ? `http://localhost:8080/getProtectedImage?type=avatars&id=0&path=${encodeURIComponent(
                      post.user.avatar
                    )}`
                  : "/icons/placeholder.svg"
              }
              alt="user avatar"
              width={45}
              height={45}
              unoptimized
            />
          </div>
          <div
            className="post-user-name"
            onClick={() => router.push(`/home/profiles/${post.user_id}`)}
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

        {post.image && (
          <div
            className="post-image-container"
            onClick={navigateToPost}
            style={{ cursor: "pointer" }}
          >
            <Image
              src={
                post.image
                  ? `http://localhost:8080/getProtectedImage?type=posts&id=${
                      post.id
                    }&path=${encodeURIComponent(post.image)}`
                  : "/icons/placeholder.svg"
              }
              alt="Post content"
              className="post-image"
              width={200}
              height={400}
              unoptimized
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
                fill="var(--brand-primary-active)"
                stroke="var(--brand-primary-active)"
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
                fill="var(--brand-primary-active)"
                stroke="var(--brand-primary-active)"
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
            {post.comments && post.comments.length > 0 && (
              <span className="comment-count">{post.comments.length}</span>
            )}
          </button>
          {showShareButton && (
            <button
              className="post-action-btn"
              onClick={handleShareClick}
              title="Manage sharing"
            >
              <Image src="/icons/send.svg" alt="share" width={24} height={24} />
            </button>
          )}
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

        <div className="post-timestamp">{post.creation_date || "Just now"}</div>
      </article>

      {showShareButton && (
        <PostShareModal
          postId={post.id}
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
        />
      )}
    </>
  );
};

export default Post;
