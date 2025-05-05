"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import "../posts.css"
import getPostData from "@/app/api/_posts/getPostData"
import reactToPost from "@/app/api/_posts/reactToPost"

export default function SinglePostPage() {
  const params = useParams()
  const router = useRouter()
  const postId = Number(params.id)

  const [post, setPost] = useState<any>({})
  const [reactions, setReactions] = useState({
    likes: 0,
    dislikes: 0,
    userReaction: null as boolean | null,
  })
  const [isReacting, setIsReacting] = useState(false)
  const [comments, setComments] = useState<any[]>([])
  const [newComment, setNewComment] = useState("")
  const [display, setDisplay] = useState("none")
  const [isLoading, setIsLoading] = useState(true)

  const pageLoadHandler = async () => {
    try {
      setIsLoading(true)
      const data = await getPostData(postId)
      if (data.error && data.error !== "") {
        throw Error(data.error)
      }
      const foundData = data.posts[0]
      console.log(foundData, data)

      if (!foundData || foundData.id === 0) {
        router.push("/404")
        return
      }

      setPost(foundData)

      // Initialize reactions from post data
      console.log("Post data loaded:", foundData)
      console.log("Reactions:", foundData.reactions)
      if (foundData.reactions) {
        setReactions({
          likes: foundData.reactions.likes || 0,
          dislikes: foundData.reactions.dislikes || 0,
          userReaction: foundData.reactions.user_reaction,
        })
      } else {
        // Default to empty reactions if none exist
        setReactions({
          likes: 0,
          dislikes: 0,
          userReaction: null,
        })
      }

      setComments(foundData.comments || [])
      setDisplay("block")
    } catch (error) {
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    pageLoadHandler()
  }, [])

  const handleReaction = async (reaction: boolean) => {
    if (isReacting) return

    // If user clicked the same reaction they already have, we'll toggle it off
    const newReaction = reactions.userReaction === reaction ? null : reaction

    setIsReacting(true)

    // Optimistic UI update
    setReactions((prev) => {
      const likeDelta =
        reaction === true
          ? newReaction === null
            ? -1
            : prev.userReaction === false
              ? 1
              : 0
          : prev.userReaction === true
            ? -1
            : 0

      const dislikeDelta =
        reaction === false
          ? newReaction === null
            ? -1
            : prev.userReaction === true
              ? 1
              : 0
          : prev.userReaction === false
            ? -1
            : 0

      return {
        likes: prev.likes + (reaction === true ? (newReaction === null ? -1 : 1) : 0),
        dislikes: prev.dislikes + (reaction === false ? (newReaction === null ? -1 : 1) : 0),
        userReaction: newReaction,
      }
    })

    try {
      const data = await reactToPost(postId, newReaction)

      if (data.error) {
        console.error("Error reacting to post:", data.error)
        // Revert optimistic update on error
        if (post.reactions) {
          setReactions({
            likes: post.reactions.likes || 0,
            dislikes: post.reactions.dislikes || 0,
            userReaction: post.reactions.user_reaction || null,
          })
        }
        return
      }

      if (data.posts && data.posts.length > 0 && data.posts[0].reactions) {
        const updatedReactions = data.posts[0].reactions
        setReactions({
          likes: updatedReactions.likes,
          dislikes: updatedReactions.dislikes,
          userReaction: updatedReactions.user_reaction,
        })
      }
    } catch (error) {
      console.error("Failed to react to post:", error)
      // Revert optimistic update on error
      if (post.reactions) {
        setReactions({
          likes: post.reactions.likes || 0,
          dislikes: post.reactions.dislikes || 0,
          userReaction: post.reactions.user_reaction || null,
        })
      }
    } finally {
      setIsReacting(false)
    }
  }

  const handleAddComment = () => {
    if (newComment.trim()) {
      const comment = {
        id: comments.length + 1,
        user: {
          name: "Current User",
          avatar: "/icons/placeholder.svg",
        },
        text: newComment,
        timestamp: "Just now",
      }
      setComments([...comments, comment])
      setNewComment("")
    }
  }

  const renderPrivacyIcon = () => {
    switch (post.privacy) {
      case "public":
        return <Image src="/icons/globe.svg" alt="globe" width={18} height={18} />
      case "almost-private":
        return <Image src="/icons/users.svg" alt="users" width={18} height={18} />
      case "private":
        return <Image src="/icons/lock.svg" alt="lock" width={18} height={18} />
      default:
        return <Image src="/icons/users.svg" alt="users" width={18} height={18} />
    }
  }

  const goBack = () => {
    router.back()
  }

  if (isLoading) {
    return (
      <div className="posts-page">
        <div className="loading-container">
          <div className="loading">Loading post...</div>
        </div>
      </div>
    )
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
    )
  }

  return (
    <div className="posts-page" style={{ display }}>
      <div className="single-post-container">
        <button onClick={goBack} className="back-button" aria-label="Go back">
          <Image src="/icons/left.svg" alt="back" width={16} height={16} />
          <span>Back</span>
        </button>

        <div className="single-post-image">
          <Image src={post.image || "/icons/placeholder.svg"} alt="Post content" fill className="post-image" />
        </div>

        <div className="single-post-content">
          <div className="single-post-header">
            <div style={{ display: "flex", alignItems: "center" }}>
              <div className="post-user-avatar" onClick={() => router.push(`/app/profiles/${post.user_id}`)}>
                <Image src={post.user?.avatar || "/icons/placeholder.svg"} alt="avatar" width={40} height={40} />
              </div>
              <div className="post-user-name" onClick={() => router.push(`/app/profiles/${post.user_id}`)}>
                {post.user?.firstname + " " + post.user?.lastname}
              </div>
              <div className="post-privacy">
                {renderPrivacyIcon()}
                {post.privacy === "public" ? "Public" : post.privacy === "almost-private" ? "Followers" : "Private"}
              </div>
            </div>
            <div style={{ marginTop: "10px" }}>
              <div className="post-caption">
                <span className="post-user-name">{post.user?.firstname + " " + post.user?.lastname}</span>{" "}
                {post.caption}
              </div>
              <div className="post-timestamp">{post.creation_date || post.timestamp}</div>
            </div>
          </div>

          <div className="single-post-comments">
            {comments.length > 0 ? (
              comments.map((comment) => (
                <div key={comment.id} className="post-comment">
                  <div className="comment-user-avatar">
                    <Image
                      src={comment.user.avatar || "/icons/placeholder.svg"}
                      alt={comment.user.name}
                      width={30}
                      height={30}
                    />
                  </div>
                  <div className="comment-content">
                    <span>
                      <span className="comment-user-name">{comment.user.name}</span>
                      <span className="comment-text">{comment.text}</span>
                    </span>
                    <div className="comment-timestamp">{comment.timestamp}</div>
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
                style={{
                  color: reactions.userReaction === true ? "var(--primary-color)" : "var(--text-color)",
                }}
                disabled={isReacting}
              >
                <Image src="/icons/heart.svg" alt="like" width={24} height={24} />
              </button>
              <button
                className="post-action-btn"
                onClick={() => handleReaction(false)}
                style={{
                  color: reactions.userReaction === false ? "var(--primary-color)" : "var(--text-color)",
                }}
                disabled={isReacting}
              >
                <Image src="/icons/thumbs-down.svg" alt="dislike" width={24} height={24} />
              </button>
              <button className="post-action-btn">
                <Image src="/icons/messages.svg" alt="messages" width={24} height={24} />
              </button>
              <button className="post-action-btn">
                <Image src="/icons/send.svg" alt="send" width={24} height={24} />
              </button>
            </div>

            <div className="post-likes">
              {reactions.likes} likes • {reactions.dislikes} dislikes
            </div>

            <form
              className="add-comment"
              onSubmit={(e) => {
                e.preventDefault()
                handleAddComment()
              }}
            >
              <input
                type="text"
                className="comment-input"
                placeholder="Add a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
              />
              <button type="submit" className="post-submit-btn">
                <Image src="/icons/send.svg" alt="send" width={16} height={16} />
                <span style={{ marginLeft: "5px" }}>Send</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
