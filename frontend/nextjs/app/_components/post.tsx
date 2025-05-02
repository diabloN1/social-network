"use client"

import type React from "react"
import { useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import reactToPost from "../api/_posts/reactToPost"

interface Comment {
  id: number
  user: {
    name: string
    avatar: string
  }
  text: string
  timestamp: string
}

interface ReactionCounts {
  likes: number
  dislikes: number
  user_reaction: boolean | null
}

interface PostProps {
  post: {
    id: number
    user_id?: number
    user: {
      firstname: string
      lastname: string
      avatar: string
    }
    image?: string
    caption: string
    privacy: string
    comments?: Comment[]
    timestamp?: string
    creation_date?: string
    reactions?: ReactionCounts
  }
}

const Post: React.FC<PostProps> = ({ post }) => {
  const [reactions, setReactions] = useState({
    likes: post.reactions?.likes || 0,
    dislikes: post.reactions?.dislikes || 0,
    userReaction: post.reactions?.user_reaction || null,
  })
  const [isReacting, setIsReacting] = useState(false)
  const [comments, setComments] = useState(post.comments || [])
  const [newComment, setNewComment] = useState("")

  const router = useRouter()

  const navigateToPost = () => {
    console.log("i'm here")
    router.push(`/app/${post.id}`)
  }

  const handleReaction = async (reaction: boolean) => {
    if (isReacting) return

    const newReaction = reactions.userReaction === reaction ? null : reaction

    setIsReacting(true)

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
      const data = await reactToPost(post.id, newReaction)

      if (data.error) {
        console.error("Error reacting to post:", data.error)
        setReactions({
          likes: post.reactions?.likes || 0,
          dislikes: post.reactions?.dislikes || 0,
          userReaction: post.reactions?.user_reaction || null,
        })
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
      setReactions({
        likes: post.reactions?.likes || 0,
        dislikes: post.reactions?.dislikes || 0,
        userReaction: post.reactions?.user_reaction || null,
      })
    } finally {
      setIsReacting(false)
    }
  }

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault()
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

  return (
    <article className="post">
      <div className="post-header">
        <div className="post-user-avatar" onClick={() => router.push(`/app/profiles/${post.user_id}`)}>
          <Image
            src={post.user.avatar || "/icons/placeholder.svg"}
            alt={post.user.avatar || "/icons/placeholder.svg"}
            width={40}
            height={40}
          />
        </div>
        <div className="post-user-name" onClick={() => router.push(`/app/profiles/${post.user_id}`)}>
          {post.user.firstname + " " + post.user.lastname}
        </div>
        <div className="post-privacy">
          {renderPrivacyIcon()}
          {post.privacy === "public" ? "Public" : post.privacy === "almost-private" ? "Followers" : "Private"}
        </div>
      </div>

      {/* Add to the post-image-container div to make it clickable: */}
      {post.image && (
        <div className="post-image-container" onClick={navigateToPost} style={{ cursor: "pointer" }}>
          <Image src={post.image || "/icons/placeholder.svg"} alt="Post content" fill className="post-image" />
        </div>
      )}

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

      <div className="post-caption">
        <span className="post-user-name">{post.user.firstname + " " + post.user.lastname}</span> {post.caption}
      </div>

      <div className="post-timestamp">{post.creation_date || post.timestamp || "Just now"}</div>

      {comments?.length > 0 && (
        <div className="post-comments">
          {comments.map((comment) => (
            <div key={comment.id} className="post-comment">
              <div className="comment-user-avatar">
                <Image
                  src={comment.user.avatar || "/icons/placeholder.svg"}
                  alt={comment.user.name || "/icons/placeholder.svg"}
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
          ))}
        </div>
      )}

      <form className="add-comment" onSubmit={handleAddComment}>
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
    </article>
  )
}

export default Post
