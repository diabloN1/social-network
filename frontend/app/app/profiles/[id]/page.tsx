"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import "./profile.css";
import getProfileData from "@/api/profiles/getProfileData";
import deleteFollow from "@/api/follow/deleteFollow";
import requestFollow from "@/api/follow/requestFollow";
import setPravicy from "@/api/profiles/setPrivacy";
import { Profile } from "@/types/user";
import Image from "next/image";

export default function ProfilePage() {
  const params = useParams();
  const router = useRouter();
  const userId = Number(params.id);

  const [user, setUser] = useState<Profile | null>(null);
  const [activeTab, setActiveTab] = useState("posts");
  const [isPending, setIsPending] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [canViewProfile, setCanViewProfile] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfileData = async () => {
      setLoading(true);
      try {
        // Use the provided initProfileData function
        const response = await getProfileData(userId);
        if (response.error) {
          alert(response.error);
          return;
        }

        const userData = response.user;
        console.log(userData);
        setUser(userData);
        setIsPending(userData.follow?.id && !userData.follow?.isAccepted);
        setIsFollowing(userData.follow?.isAccepted);
        setCanViewProfile(
          !userData.isprivate ||
            userData.currentuser ||
            userData.follow?.isAccepted
        );
      } catch (error) {
        console.error("Error fetching profile data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [userId]);

  // Toggle private/public profile
  const togglePrivateProfile = async () => {
    if (!user) return;
    try {
      const data = await setPravicy(!user.isprivate);
      if (data.error) {
        alert(data.error);
        return;
      }

      setUser((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          isprivate: !prev.isprivate,
        };
      });
    } catch (error) {
      alert(error);
    }
  };

  // Handle follow/unfollow
  const handleFollowAction = async () => {
    try {
      if (isFollowing || isPending) {
        const data = await deleteFollow(userId, true);
        if (data.error) {
          alert(data.error);
          return;
        }

        setIsFollowing(false);
        setIsPending(false);

        if (user?.isprivate) {
          setCanViewProfile(false);
        }
      } else if (!user?.follow?.id) {
        const data = await requestFollow(userId);
        if (data.error) {
          alert(data.error);
          return;
        }

        if (user?.isprivate) {
          setIsPending(true);
        } else {
          setIsFollowing(true);
          setCanViewProfile(true);
        }
      }
    } catch (error) {
      alert(error);
      return;
    }
  };

  // Go back to profile list
  const goBack = () => {
    router.push("/app/profiles");
  };

  if (loading) {
    return (
      <div className="profile-container">
        <div className="loading-spinner">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="profile-container">
        <div className="error-message">Failed to load profile data</div>
      </div>
    );
  }

  const fullName = `${user.firstname} ${user.lastname}`;
  const displayName = fullName;
  const followersCount = user.followers?.length || 0;
  const followingCount = user.following?.length || 0;

  return (
    <div className="profile-container">
      <button className="back-button" onClick={goBack}>
        ← Back
      </button>

      <div className="profile-header">
        <div className="profile-avatar">
          <Image
            src={
              user.avatar
                ? `http://localhost:8080/getProtectedImage?type=avatars&id=0&path=${encodeURIComponent(
                    user.avatar
                  )}`
                : "/icons/placeholder.svg"
            }
            alt="user avatar"
            width={150}
            height={150}
            unoptimized
          />
        </div>

        <div className="profile-info">
          <div className="profile-name-section">
            <h1>{displayName}</h1>
            <span className="nickname">@{user.nickname}</span>

            {user.currentuser ? (
              <button
                className={`privacy-toggle ${
                  user.isprivate ? "private" : "public"
                }`}
                onClick={togglePrivateProfile}
              >
                {user.isprivate ? "Private Profile" : "Public Profile"}
              </button>
            ) : (
              <button
                className={`follow-button ${
                  isFollowing || isPending ? "following" : ""
                }`}
                onClick={handleFollowAction}
              >
                {isFollowing ? "Following" : isPending ? "Pending" : "Follow"}
              </button>
            )}
          </div>

          <div className="profile-stats">
            <div className="stat">
              <span className="count">{user.posts?.length || 0}</span>
              <span className="label">Posts</span>
            </div>
            <div className="stat">
              <span className="count">{followersCount}</span>
              <span className="label">Followers</span>
            </div>
            <div className="stat">
              <span className="count">{followingCount}</span>
              <span className="label">Following</span>
            </div>
          </div>

          <div className="profile-bio">
            {user.about && <p>{user.about}</p>}
            <p className="email">{user.email}</p>
            {user.birth && (
              <p className="birth-date">
                Born: {new Date(user.birth).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>
      </div>

      {!canViewProfile ? (
        <div className="private-profile-message">
          <div className="lock-icon">🔒</div>
          <h2>This Account is Private</h2>
          <p>Follow this account to see their photos and videos.</p>
        </div>
      ) : (
        <>
          <div className="profile-tabs">
            <button
              className={`tab ${activeTab === "posts" ? "active" : ""}`}
              onClick={() => setActiveTab("posts")}
            >
              Posts
            </button>
            <button
              className={`tab ${activeTab === "followers" ? "active" : ""}`}
              onClick={() => setActiveTab("followers")}
            >
              Followers
            </button>
            <button
              className={`tab ${activeTab === "following" ? "active" : ""}`}
              onClick={() => setActiveTab("following")}
            >
              Following
            </button>
          </div>

          <div className="profile-content">
            {activeTab === "posts" && (
              <div className="posts-grid">
                {user.posts && user.posts.length > 0 ? (
                  user.posts.map((post) => (
                    <div
                      key={post.id}
                      className="post-item"
                      onClick={() => router.push(`/app/${post.id}`)}
                    >
                      {post.image && (
                        <Image
                          src={`http://localhost:8080/getProtectedImage?type=posts&id=${
                            post.id
                          }&path=${encodeURIComponent(post.image)}`}
                          alt="Post content"
                          className="post-image"
                          width={400}
                          height={400}
                          unoptimized
                        />
                      )}
                      <div className="post-overlay">
                        <div className="post-stats">
                          <span>❤️ 0</span>{" "}
                          {/* Placeholder until we get real data */}
                          <span>💬 0</span>{" "}
                          {/* Placeholder until we get real data */}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="no-content">No posts yet</div>
                )}
              </div>
            )}

            {activeTab === "followers" && (
              <div className="users-list">
                {user.followers && user.followers.length > 0 ? (
                  user.followers.map((follower) => (
                    <div
                      key={follower.id}
                      className="user-card"
                      onClick={() =>
                        router.push(`/app/profiles/${follower.id}`)
                      }
                    >
                      <div className="user-info">
                        <Image
                          src={
                            follower.avatar
                              ? `http://localhost:8080/getProtectedImage?type=avatars&id=0&path=${encodeURIComponent(
                                  follower.avatar
                                )}`
                              : "/icons/placeholder.svg"
                          }
                          alt="user avatar"
                          width={40}
                          height={40}
                          unoptimized
                        />
                        <div className="user-details">
                          <span className="user-name">
                            {follower.nickname ||
                              `${follower.firstname} ${follower.lastname}`}
                          </span>
                          <span className="nickname">@{follower.nickname}</span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="no-content">No followers yet</div>
                )}
              </div>
            )}

            {activeTab === "following" && (
              <div className="users-list">
                {user.following && user.following.length > 0 ? (
                  user.following.map((following) => (
                    <div
                      key={following.id}
                      className="user-card"
                      onClick={() =>
                        router.push(`/app/profiles/${following.id}`)
                      }
                    >
                      <div className="user-info">
                        <Image
                          src={
                            following.avatar
                              ? `http://localhost:8080/getProtectedImage?type=avatars&id=0&path=${encodeURIComponent(
                                  following.avatar
                                )}`
                              : "/icons/placeholder.svg"
                          }
                          alt="user avatar"
                          width={40}
                          height={40}
                          unoptimized
                        />
                        <div className="user-details">
                          <span className="user-name">
                            {following.nickname ||
                              `${following.firstname} ${following.lastname}`}
                          </span>
                          <span className="nickname">
                            @{following.nickname}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="no-content">Not following anyone yet</div>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
