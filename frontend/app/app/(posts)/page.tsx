"use client";

import { useEffect, useState } from "react";
import CreatePostModal from "@/components/create-post-modal";
import Post from "@/components/post";
import "./posts.css";
import addPost from "@/api/posts/addPost";
import getPosts from "@/api/posts/getPosts";
import Popup from "../popup";
import { Post as PostType, Reaction } from "@/types/post";

export default function PostsPage() {
  const [posts, setPosts] = useState<PostType[]>([]);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [popup, setPopup] = useState<{
    message: string;
    status: "success" | "failure";
  } | null>(null);
  const [hasMore, setHasMore] = useState(true);

  const fetchPosts = async () => {
    try {
      setIsLoading(true);
      const data = await getPosts(0);
      if (data && data.data?.posts) {
        const { posts, userid } = data.data;
        // console.log("Fetched posts:", data);
        // console.log("Current user ID from API:", userid);
        setPosts(posts);
        setCurrentUserId(userid);
        setHasMore(posts.length === 10);
      }
    } catch (error) {
      setPopup({ message: `${error}`, status: "failure" });
    } finally {
      setIsLoading(false);
    }
  };
  const fetchMorePosts = async () => {
    if (posts.length === 0) return;

    const lastId = posts[posts.length - 1].id;
    // console.log("posts", posts);

    try {
      setIsLoading(true);
      const data = await getPosts(lastId);
      if (data?.data?.posts?.length) {
        setPosts((prev) => [...prev, ...data.data.posts]);
        setHasMore(data.data.posts.length === 10);
      }
    } catch (error) {
      setPopup({ message: `${error}`, status: "failure" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleCreatePost = async (newPost: {
    image: string;
    caption: string;
    privacy?: string;
    groupId?: number;
  }) => {
    try {
      const data = await addPost(newPost);

      if (data.error && data.error !== "Invalid session") {
        setPopup({ message: data.error, status: "failure" });
        return;
      }

      if (data.posts && data.posts[0]) {
        setPosts([data.posts[0], ...posts]);
      }
    } catch (err) {
      setPopup({ message: `${err}`, status: "failure" });
    }

    setIsModalOpen(false);
  };

  // Function to update post reaction in the posts list
  const handleReactionUpdate = (postId: number, reactionData: Reaction) => {
    setPosts((currentPosts) =>
      currentPosts.map((post) =>
        post.id === postId
          ? {
              ...post,
              reactions: {
                likes: reactionData.likes,
                dislikes: reactionData.dislikes,
                userReaction: reactionData.userReaction,
              },
            }
          : post
      )
    );
  };

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
          posts.map((post) => {
            console.log(
              `Post ${post.id} - Owner: ${post.user_id}, Current User: ${currentUserId}, Privacy: ${post.privacy}`
            );
            return (
              <Post
                key={post.id}
                post={post}
                currentUserId={currentUserId}
                onReactionUpdate={handleReactionUpdate}
              />
            );
          })
        )}
        {!isLoading && posts.length > 0 && hasMore && (
          <button onClick={fetchMorePosts} className="load-more-btn">
            Load More
          </button>
        )}
      </main>

      {isModalOpen && (
        <CreatePostModal
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleCreatePost}
        />
      )}
      {popup && (
        <Popup
          message={popup.message}
          status={popup.status}
          onClose={() => setPopup(null)}
        />
      )}
    </div>
  );
}
