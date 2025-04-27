"use client";

import { useState } from "react";
import CreatePostModal from "../_components/create-post-modal";
import Post from "../_components/post";
import "./posts.css";

// Sample data for demonstration
export const SAMPLE_POSTS = [
  {
    id: 1,
    user: {
      name: "John Doe",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    image: "/placeholder.svg?height=500&width=500",
    caption: "This is my first post! #excited",
    likes: 42,
    privacy: "public",
    comments: [
      {
        id: 1,
        user: {
          name: "Jane Smith",
          avatar: "/placeholder.svg?height=30&width=30",
        },
        text: "Great post! 👍",
        timestamp: "2h ago",
      },
    ],
    timestamp: "3h ago",
  },
  {
    id: 2,
    user: {
      name: "Alice Johnson",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    image: "/placeholder.svg?height=500&width=500",
    caption: "Beautiful sunset today! 🌅",
    likes: 128,
    privacy: "almost-private",
    comments: [],
    timestamp: "5h ago",
  },
];

export default function PostsPage() {
  const [posts, setPosts] = useState(SAMPLE_POSTS);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCreatePost = (newPost: {
    image: string;
    caption: string;
    privacy: string;
  }) => {
    setPosts([
      {
        id: posts.length + 1,
        user: {
          name: "Current User",
          avatar: "/placeholder.svg?height=40&width=40",
        },
        likes: 0,
        comments: [],
        timestamp: "Just now",
        ...newPost,
      },
      ...posts,
    ]);
    setIsModalOpen(false);
  };

  return (
    <div className="posts-page">
      <button className="create-post-btn" onClick={() => setIsModalOpen(true)}>
        Create Post
      </button>

      <main className="posts-container">
        {posts.map((post) => (
          <Post key={post.id} post={post} />
        ))}
      </main>

      {isModalOpen && (
        <CreatePostModal
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleCreatePost}
        />
      )}
    </div>
  );
}
