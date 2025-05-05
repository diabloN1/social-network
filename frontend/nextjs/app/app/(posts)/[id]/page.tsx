"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import "../posts.css";
import getPostData from "@/app/api/_posts/getPostData";
import reactToPost from "@/app/api/_posts/reactToPost";
import addComment from "@/app/api/_posts/addComment";
import getComments from "@/app/api/_posts/getComments";

export default function SinglePostPage() {
  const params = useParams();
  const router = useRouter();
  const postId = Number(params.id);

  const [post, setPost] = useState<any>({});
  const [reactions, setReactions] = useState({
    likes: 0,
    dislikes: 0,
    userReaction: null as boolean | null,
  });
  const [isReacting, setIsReacting] = useState(false);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isAddingComment, setIsAddingComment] = useState(false);
  const [display, setDisplay] = useState("none");
  const [isLoading, setIsLoading] = useState(true);

  const pageLoadHandler = async () => {
    try {
      setIsLoading(true);

      // Fetch post data
      const data = await getPostData(postId);
      if (data.error && data.error !== "") {
        throw Error(data.error);
      }

      const foundData = data.posts[0];
      console.log("Post data loaded:", foundData);

      // Debug the reactions data structure
      console.log("Reactions from API:", foundData.reactions);

      if (!foundData || foundData.id === 0) {
        router.push("/404");
        return;
      }

      setPost(foundData);

      // Set reactions from post data
      if (foundData.reactions) {
        console.log("Setting reactions from post data:", {
          likes: foundData.reactions.likes || 0,
          dislikes: foundData.reactions.dislikes || 0,
          userReaction: foundData.reactions.user_reaction,
        });

        setReactions({
          likes: foundData.reactions.likes || 0,
          dislikes: foundData.reactions.dislikes || 0,
          userReaction: foundData.reactions.user_reaction,
        });
      }

      // Load comments
      await loadComments();

      setDisplay("block");
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadComments = async () => {
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
  };

  useEffect(() => {
    pageLoadHandler();
  }, []);

  const handleReaction = async (reaction: boolean) => {
    if (isReacting) return;
    setIsReacting(true);

    // If user clicked the same reaction they already have, we'll toggle it off (null)
    const newReaction = reactions.userReaction === reaction ? null : reaction;
    console.log(
      "Current reaction:",
      reactions.userReaction,
      "New reaction:",
      newReaction
    );

    // Optimistic UI update
    setReactions((prev) => {
      // Calculate new likes/dislikes based on the change
      let newLikes = prev.likes;
      let newDislikes = prev.dislikes;

      // If removing a like
      if (prev.userReaction === true && newReaction === null) {
        newLikes--;
      }
      // If adding a like
      else if (prev.userReaction !== true && newReaction === true) {
        newLikes++;
        // If switching from dislike to like
        if (prev.userReaction === false) {
          newDislikes--;
        }
      }
      // If removing a dislike
      else if (prev.userReaction === false && newReaction === null) {
        newDislikes--;
      }
      // If adding a dislike
      else if (prev.userReaction !== false && newReaction === false) {
        newDislikes++;
        // If switching from like to dislike
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
      console.log("Reaction response:", data);

      if (data.error) {
        console.error("Error reacting to post:", data.error);
        // Revert optimistic update on error
        if (post.reactions) {
          setReactions({
            likes: post.reactions.likes || 0,
            dislikes: post.reactions.dislikes || 0,
            userReaction: post.reactions.user_reaction || null,
          });
        }
        return;
      }

      if (data.posts && data.posts.length > 0 && data.posts[0].reactions) {
        const updatedReactions = data.posts[0].reactions;
        console.log("Updated reactions from API:", updatedReactions);

        setReactions({
          likes: updatedReactions.likes,
          dislikes: updatedReactions.dislikes,
          userReaction: updatedReactions.user_reaction,
        });
      }
    } catch (error) {
      console.error("Failed to react to post:", error);
      // Revert optimistic update on error
      if (post.reactions) {
        setReactions({
          likes: post.reactions.likes || 0,
          dislikes: post.reactions.dislikes || 0,
          userReaction: post.reactions.user_reaction || null,
        });
      }
    } finally {
      setIsReacting(false);
    }
  };

  const handleAddComment = async () => {
    if (newComment.trim() === "" || isAddingComment) return;

    setIsAddingComment(true);

    try {
      const data = await addComment(postId, newComment.trim());

      if (data.error) {
        throw new Error(data.error);
      }

      // If the API returns the updated comments, use them
      if (data.posts && data.posts[0] && data.posts[0].comments) {
        setComments(data.posts[0].comments);
      } else {
        // Otherwise, reload comments
        await loadComments();
      }

      setNewComment("");
    } catch (error) {
      console.error("Error adding comment:", error);
    } finally {
      setIsAddingComment(false);
    }
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

  const goBack = () => {
    router.back();
  };

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
    <div className="posts-page" style={{ display }}>
      <div className="single-post-container">
        <button onClick={goBack} className="back-button" aria-label="Go back">
          <Image src="/icons/left.svg" alt="back" width={16} height={16} />
          <span>Back</span>
        </button>

        <div className="single-post-image">
          <Image
            src={post.image || "/icons/placeholder.svg"}
            alt="Post content"
            fill
            className="post-image"
          />
        </div>

        <div className="single-post-content">
          <div className="single-post-header">
            <div style={{ display: "flex", alignItems: "center" }}>
              <div
                className="post-user-avatar"
                onClick={() => router.push(`/app/profiles/${post.user_id}`)}
              >
                <Image
                  src={post.user?.avatar || "/icons/placeholder.svg"}
                  alt="avatar"
                  width={40}
                  height={40}
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
              <div className="post-timestamp">
                {post.creation_date || post.timestamp}
              </div>
            </div>
          </div>

          <div className="single-post-comments">
            {comments.length > 0 ? (
              comments.map((comment) => (
                <div key={comment.id} className="post-comment">
                  <div className="comment-user-avatar">
                    <Image
                      src={"/icons/placeholder.svg"}
                      alt={"User avatar"}
                      width={30}
                      height={30}
                    />
                  </div>
                  <div className="comment-content">
                    <span>
                      <span className="comment-user-name">
                        {comment.author}
                      </span>
                      <span className="comment-text">{comment.text}</span>
                    </span>
                    <div className="comment-timestamp">
                      {comment.creation_date}
                    </div>
                  </div>
                </div>
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
              <button className="post-action-btn">
                <Image
                  src="/icons/send.svg"
                  alt="send"
                  width={24}
                  height={24}
                />
              </button>
            </div>

            <div className="post-likes">
              {reactions.likes} likes • {reactions.dislikes} dislikes
            </div>

            <form
              className="add-comment"
              onSubmit={(e) => {
                e.preventDefault();
                handleAddComment();
              }}
            >
              <input
                type="text"
                className="comment-input"
                placeholder="Add a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                disabled={isAddingComment}
              />
              <button
                type="submit"
                className="post-submit-btn"
                disabled={isAddingComment || newComment.trim() === ""}
              >
                <Image
                  src="/icons/send.svg"
                  alt="send"
                  width={16}
                  height={16}
                />
                <span style={{ marginLeft: "5px" }}>Send</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
