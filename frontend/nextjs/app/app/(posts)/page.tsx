"use client"

import { useEffect, useState } from "react"
import CreatePostModal from "../../_components/create-post-modal"
import Post from "../../_components/post"
import "./posts.css"
import addPost from "../../api/_posts/addPost"
import getPosts from "../../api/_posts/getPosts"

export default function PostsPage() {
  const [posts, setPosts] = useState<any[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setIsLoading(true)
        const data = await getPosts(0)
        if (data && data.posts) {
          setPosts(data.posts)
        }
      } catch (error) {
        console.error(error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchPosts()
  }, [])

  const handleCreatePost = async (newPost: {
    image: string
    caption: string
    privacy: string
  }) => {
    try {
      const data = await addPost(newPost)

      if (data.error && data.error !== "Invalid session") {
        alert(data.error)
        return
      }

      if (data.posts && data.posts[0]) {
        setPosts([data.posts[0], ...posts])
      } else {
        const user = data.posts?.[0]?.user || {}
        setPosts([
          {
            id: posts.length + 1000,
            user: {
              firstname: user.firstname,
              lastname: user.lastname,
              avatar: user.avatar,
            },
            reactions: { likes: 0, dislikes: 0, user_reaction: null },
            comments: [],
            timestamp: "Just now",
            ...newPost,
          },
          ...posts,
        ])
      }
    } catch (err) {
      console.error(err)
    }

    setIsModalOpen(false)
  }

  return (
    <div className="posts-page">
      <button className="create-post-btn" onClick={() => setIsModalOpen(true)}>
        Create Post
      </button>

      <main className="posts-container">
        {isLoading ? (
          <div className="loading">Loading posts...</div>
        ) : posts.length === 0 ? (
          <div className="no-posts">No posts yet. Create your first post!</div>
        ) : (
          posts.map((post) => <Post key={post.id} post={post} />)
        )}
      </main>

      {isModalOpen && <CreatePostModal onClose={() => setIsModalOpen(false)} onSubmit={handleCreatePost} />}
    </div>
  )
}
