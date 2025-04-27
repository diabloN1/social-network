"use client"

import type React from "react"
import { useState } from "react"
import Image from "next/image"

// Add navigation to individual post page
import { useRouter } from "next/navigation"

interface Comment {
  id: number
  user: {
    name: string
    avatar: string
  }
  text: string
  timestamp: string
}

interface PostProps {
  post: {
    id: number
    user: {
      name: string
      avatar: string
    }
    image: string
    caption: string
    likes: number
    privacy: string
    comments: Comment[]
    timestamp: string
  }
}

const Post: React.FC<PostProps> = ({ post }) => {
  const [liked, setLiked] = useState(false)
  const [likes, setLikes] = useState(post.likes)
  const [comments, setComments] = useState(post.comments)
  const [newComment, setNewComment] = useState("")

  // Add inside the Post component, before the return statement:
  const router = useRouter()

  const navigateToPost = () => {
    router.push(`/app/${post.id}`)
  }

  // Update the handleLike function to properly toggle likes
  const handleLike = () => {
    if (liked) {
      setLikes(likes - 1)
    } else {
      setLikes(likes + 1)
    }
    setLiked(!liked)
  }

  // Update the comment form to include a visible send button with an icon
  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault()
    if (newComment.trim()) {
      const comment = {
        id: comments.length + 1,
        user: {
          name: "Current User",
          avatar: "/placeholder.svg?height=30&width=30",
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
        return <Image src='/icons/globe.svg' alt='globe' width={18} height={18} />
      case "almost-private":
        return <Image src='/icons/users.svg' alt='users' width={18} height={18} />
      case "private":
        return <Image src='/icons/lock.svg' alt='lock' width={18} height={18} />
      default:
        return <Image src='/icons/users.svg' alt='users' width={18} height={18} />
    }
  }

  return (
    <article className="post">
      <div className="post-header">
        <div className="post-user-avatar">
          <Image src={post.user.avatar || "/placeholder.svg"} alt={post.user.name} width={40} height={40} />
        </div>
        <div className="post-user-name">{post.user.name}</div>
        <div className="post-privacy">
          {renderPrivacyIcon()}
          {post.privacy === "public" ? "Public" : post.privacy === "almost-private" ? "Followers" : "Private"}
        </div>
      </div>

      {/* Add to the post-image-container div to make it clickable: */}
      <div className="post-image-container" onClick={navigateToPost} style={{ cursor: "pointer" }}>
        <Image src={post.image || "/placeholder.svg"} alt="Post content" fill className="post-image" />
      </div>

      <div className="post-actions">
        <button
          className="post-action-btn"
          onClick={handleLike}
          style={{ color: liked ? "var(--primary-color)" : "var(--text-color)" }}
        >
          <Image src='/icons/heart.svg' alt='heart' width={24} height={24} />
        </button>
        <button className="post-action-btn">
          <Image src='/icons/messages.svg' alt='messages' width={24} height={24} />
        </button>
        <button className="post-action-btn">
          <Image src='/icons/send.svg' alt='send' width={24} height={24} />
        </button>
      </div>

      <div className="post-likes">{likes} likes</div>

      <div className="post-caption">
        <span className="post-user-name">{post.user.name}</span> {post.caption}
      </div>

      <div className="post-timestamp">{post.timestamp}</div>

      {comments.length > 0 && (
        <div className="post-comments">
          {comments.map((comment) => (
            <div key={comment.id} className="post-comment">
              <div className="comment-user-avatar">
                <Image src={comment.user.avatar || "/placeholder.svg"} alt={comment.user.name} width={30} height={30} />
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

      {/* Replace the form in the return statement with this updated version
      that includes a more visible send button */}
      <form className="add-comment" onSubmit={handleAddComment}>
        <input
          type="text"
          className="comment-input"
          placeholder="Add a comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
        />
        <button type="submit" className="post-submit-btn">
          <Image src='/icons/send.svg' alt='send' width={16} height={16} />
          <span style={{ marginLeft: "5px" }}>Send</span>
        </button>
      </form>
    </article>
  )
}

export default Post
