"use client";

import { useCallback, useEffect, useState } from "react";
import CreatePostModal from "@/components/create-post-modal";
import Post from "@/components/post";
import { Post as PostType, Reaction } from "@/types/post";
import { useGlobalAPIHelper } from "@/helpers/GlobalAPIHelper";

export default function PostsPage() {
  const { apiCall } = useGlobalAPIHelper();
  const [posts, setPosts] = useState<PostType[]>([]);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const fetchPosts = useCallback(async () => {
    setIsLoading(true);
    const data = await apiCall(
      {
        type: "get-posts",
        data: { startId: 0 },
      },
      "POST",
      "getPosts"
    );

    if (data?.posts) {
      const { posts, userid } = data;
      setPosts(posts);
      setCurrentUserId(userid);
      setHasMore(posts.length === 10);
    }

    setIsLoading(false);
  }, [apiCall]);

  const fetchMorePosts = async () => {
    if (posts.length === 0) return;

    const lastId = posts[posts.length - 1].id;
    setIsLoading(true);

    const data = await apiCall(
      {
        type: "get-posts",
        data: { startId: lastId },
      },
      "POST",
      "getPosts"
    );

    if (data?.posts?.length) {
      setPosts((prev) => [...prev, ...data.posts]);
      setHasMore(data.posts.length === 10);
    }

    setIsLoading(false);
  };

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handleCreatePost = async (newPost: {
    image: string;
    caption: string;
    privacy?: string;
    groupId?: number;
  }) => {
    try {
      const data = await apiCall(
        {
          type: "add-post",
          data: newPost,
        },
        "POST",
        "addPost"
      );

      if (data?.post) {
        setPosts([data.post, ...posts]);
      } else {
        return;
      }
    } catch (err) {
      console.log(err);
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
    </div>
  );
}
