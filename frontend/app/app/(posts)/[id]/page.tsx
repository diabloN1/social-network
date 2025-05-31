"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import "../posts.css";
import "./post.css";
import getPostData from "@/api/posts/getPostData";
import reactToPost from "@/api/posts/reactToPost";
import getComments from "@/api/posts/getComments";
import CommentForm from "@/components/comment-form";
import Comment from "@/components/comment";
import PostShareModal from "@/components/post-share-modal";
import Popup from "../../popup";
import { Post } from "@/types/post";
import { Comment as CommentType } from "@/types/comment";

export default function SinglePostPage() {
  const params = useParams();
  const router = useRouter();
  const postId = Number(params.id);

  const [post, setPost] = useState<Post | null>(null);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [reactions, setReactions] = useState({
    likes: 0,
    dislikes: 0,
    userReaction: null as boolean | null,
  });
  const [isReacting, setIsReacting] = useState(false);
  const [comments, setComments] = useState<CommentType[]>([]);
  const [display, setDisplay] = useState("none");
  const [isLoading, setIsLoading] = useState(true);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [popup, setPopup] = useState<{
    message: string;
    status: "success" | "failure";
  } | null>(null);

  const loadComments = useCallback(async () => {
    try {
      const commentsData = await getComments(postId);
      if (commentsData.error) {
        throw new Error(commentsData.error);
      }

      if (
        commentsData.posts &&
        commentsData.posts[0] &&
        commentsData.posts[0].comments
      ) {
        setComments(commentsData.posts[0].comments);
      }
    } catch (error) {
      console.error("Error loading comments:", error);
    }
  }, [postId]);

  const pageLoadHandler = useCallback(async () => {
    try {
      setIsLoading(true);

      // Fetch post data
      const data = await getPostData(postId);
      if (data.error) {
        throw Error(data.error);
      }

      const post = data.post;

      if (!post || post.id === 0) {
        router.push("/404");
        return;
      }

      setPost(post);
      setCurrentUserId(data.userid);

      // Set reactions from post data
      if (post.reactions) {
        setReactions({
          likes: post.reactions.likes || 0,
          dislikes: post.reactions.dislikes || 0,
          userReaction: post.reactions.userReaction,
        });
      }

      // Load comments
      await loadComments();

      setDisplay("block");
    } catch (error) {
      setPopup({ message: `${error}`, status: "failure" });
    } finally {
      setIsLoading(false);
    }
  }, [postId, router, loadComments]);

  useEffect(() => {
    pageLoadHandler();
  }, [pageLoadHandler]);

  const handleReaction = async (reaction: boolean) => {
    if (isReacting) return;
    setIsReacting(true);

    const newReaction = reactions.userReaction === reaction ? null : reaction;

    // Optimistic UI update
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
      const data = await reactToPost(postId, newReaction);

      if (data.error) {
        console.error("Error reacting to post:", data.error);
        if (post?.reactions) {
          setReactions({
            likes: post.reactions.likes || 0,
            dislikes: post.reactions.dislikes || 0,
            userReaction: post.reactions.userReaction || null,
          });
        }
        return;
      }

      if (data.posts && data.posts.length > 0 && data.posts[0].reactions) {
        const updatedReactions = data.posts[0].reactions;
        setReactions({
          likes: updatedReactions.likes,
          dislikes: updatedReactions.dislikes,
          userReaction: updatedReactions.userReaction,
        });
      }
    } catch (error) {
      console.error("Failed to react to post:", error);
      if (post?.reactions) {
        setReactions({
          likes: post.reactions.likes || 0,
          dislikes: post.reactions.dislikes || 0,
          userReaction: post.reactions.userReaction || null,
        });
      }
    } finally {
      setIsReacting(false);
    }
  };

  const renderPrivacyIcon = () => {
    switch (post?.privacy) {
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

  const handleShareClick = () => {
    setIsShareModalOpen(true);
  };

  const goBack = () => {
    router.back();
  };

  // Check if current user owns this post and it's private
  const showShareButton =
    post?.privacy === "private" && post?.user_id === currentUserId;

  if (isLoading) {
    return (
      <div className="posts-page">
        <div className="loading-container">
          <div className="loading">Loading post...</div>
        </div>
      </div>
    );
  }

  if (!post || !post.id) {
    return (
      <div className="posts-page">
        <div className="error-container">
          <div className="error">Post not found</div>
          <button className="back-btn" onClick={goBack}>
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="posts-page" style={{ display }}>
        <div className="single-post-container">
          <button onClick={goBack} className="back-button" aria-label="Go back">
            <Image src="/icons/left.svg" alt="back" width={16} height={16} />
            <span>Back</span>
          </button>

          <Image
            src={
              post.image
                ? `http://localhost:8080/getProtectedImage?type=posts&id=${
                    post.id
                  }&path=${encodeURIComponent(post.image)}`
                : "/icons/placeholder.svg"
            }
            alt="Post content"
            width={500}
            height={300}
            className="single-post-image"
            unoptimized
          />

          <div className="single-post-content">
            <div className="single-post-header">
              <div style={{ display: "flex", alignItems: "center" }}>
                <div
                  className="post-user-avatar"
                  onClick={() => router.push(`/app/profiles/${post.user_id}`)}
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
                  onClick={() => router.push(`/app/profiles/${post.user_id}`)}
                >
                  {post.user?.firstname + " " + post.user?.lastname}
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
              <div style={{ marginTop: "10px" }}>
                <div className="post-caption">
                  <span className="post-user-name">
                    {post.user?.firstname + " " + post.user?.lastname}
                  </span>{" "}
                  {post.caption}
                </div>
                <div className="post-timestamp">{post.creation_date}</div>
              </div>
            </div>

            <div className="single-post-comments">
              {comments.length > 0 ? (
                comments.map((comment) => (
                  <Comment key={comment.id} comment={comment} postID={postId} />
                ))
              ) : (
                <div className="no-comments">No comments yet</div>
              )}
            </div>

            <div className="single-post-actions">
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
                    reactions.userReaction === false
                      ? "Remove dislike"
                      : "Dislike"
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
                {showShareButton && (
                  <button
                    className="post-action-btn"
                    onClick={handleShareClick}
                    title="Manage sharing"
                  >
                    <Image
                      src="/icons/send.svg"
                      alt="share"
                      width={24}
                      height={24}
                    />
                  </button>
                )}
              </div>

              <div className="post-likes">
                {reactions.likes} likes • {reactions.dislikes} dislikes • (
                {post.comment_count ?? post.comments?.length ?? 0}) Comments
              </div>

              <CommentForm
                postId={postId}
                onCommentAdded={async () => {
                  await loadComments();
                  setPost((prev) => {
                    if (!prev) return prev;
                    return {
                      ...prev,
                      comment_count: (prev.comment_count || 0) + 1,
                    };
                  });
                }}
                disabled={isLoading}
              />
            </div>
          </div>
        </div>
      </div>

      {showShareButton && (
        <PostShareModal
          postId={post.id}
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
        />
      )}
      {popup && (
        <Popup
          message={popup.message}
          status={popup.status}
          onClose={() => setPopup(null)}
        />
      )}
    </>
  );
}
