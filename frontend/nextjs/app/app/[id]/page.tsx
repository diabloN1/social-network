"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import "../posts.css";
import getPostData from "@/app/api/_posts/getPostData";

export default function SinglePostPage() {
  const params = useParams();
  const router = useRouter();
  const postId = Number(params.id);

  const [post, setPost] = useState<any>({});
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(0);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  const [display, setDisplay] = useState('none')

  const pageLoadHandler = async () => {
    try {
      const data = await getPostData(postId);
      if (data.error != "") {
        throw Error(data.error)
      }
      const foundData = data.posts[0] || null
      console.log(foundData)
      if (foundData) {
        post;
        setPost(foundData);
        setLikes(0);
        setComments([]);
      }
      setDisplay('block')
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    pageLoadHandler()
  }, []);

  const handleLike = () => {
    if (liked) {
      setLikes(likes - 1);
    } else {
      setLikes(likes + 1);
    }
    setLiked(!liked);
  };

  const handleAddComment = () => {
    if (newComment.trim()) {
      const comment = {
        id: comments.length + 1,
        user: {
          name: "Current User",
          avatar: "/icons/placeholder.svg?height=30&width=30",
        },
        text: newComment,
        timestamp: "Just now",
      };
      setComments([...comments, comment]);
      setNewComment("");
    }
  };

  const renderPrivacyIcon = (privacy: string) => {
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

  if (!post) {
    return <div>Loading...</div>;
  }

  return (
    <div className="posts-page" style={{display}}>
      <div className="single-post-container">
        <button
          onClick={goBack}
          style={{
            background: "none",
            border: "none",
            color: "var(--text-color)",
            display: "flex",
            cursor: "pointer",
            marginBottom: "16px",
          }}
        >
          <Image src="/icons/left.svg" alt="back" width={16} height={16} />
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
              <div className="post-user-avatar">
                <Image
                  src={post.user?.avatar || "/icons/placeholder.svg"}
                  alt="avatar"
                  width={40}
                  height={40}
                />
              </div>
              <div className="post-user-name">{post.user?.firstname + " " + post.user?.lastname}</div>
              <div className="post-privacy">
                {renderPrivacyIcon(post.privacy)}
                {post.privacy === "public"
                  ? "Public"
                  : post.privacy === "almost-private"
                  ? "Followers"
                  : "Private"}
              </div>
            </div>
            <div style={{ marginTop: "10px" }}>
              <div className="post-caption">
                <span className="post-user-name">{post.user?.firstname + " " + post.user?.lastname}</span>{" "}
                {post.caption}
              </div>
              <div className="post-timestamp">{post.timestamp}</div>
            </div>
          </div>

          <div className="single-post-comments">
            {comments.map((comment) => (
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
                    <span className="comment-user-name">
                      {comment.user.name}
                    </span>
                    <span className="comment-text">{comment.text}</span>
                  </span>
                  <div className="comment-timestamp">{comment.timestamp}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="single-post-actions">
            <div className="post-actions">
              <button
                className="post-action-btn"
                onClick={handleLike}
                style={{
                  color: liked ? "var(--primary-color)" : "var(--text-color)",
                }}
              >
                <Image
                  src="/icons/heart.svg"
                  alt="heart"
                  width={24}
                  height={24}
                />
              </button>
              <button className="post-action-btn">
                <Image
                  src="/icons/messages.svg"
                  alt="messages"
                  width={24}
                  height={24}
                />
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

            <div className="post-likes">{likes} likes</div>

            <form className="add-comment">
              <input
                type="text"
                className="comment-input"
                placeholder="Add a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
              />
              <button
                type="button"
                className="post-submit-btn"
                onClick={handleAddComment}
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
