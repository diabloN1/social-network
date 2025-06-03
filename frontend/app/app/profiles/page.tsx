"use client";

import type React from "react";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import "./styles.css";
// import getProfiles from "@/api/profiles/getProfiles";
// import acceptFollow from "@/api/follow/acceptFollow";
// import deleteFollow from "@/api/follow/deleteFollow";
// import hasNewFollowNotification from "@/api/follow/getPuplicFollowReq";
// import Popup from "../popup";
// import deleteFollowNotification from "@/api/follow/deletPuplicNotiFollow";

import { useGlobalAPIHelper } from "@/helpers/GlobalAPIHelper";
import { User } from "@/types/user";
import Image from "next/image";

export default function ProfilesPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [followRequests, setFollowRequests] = useState<User[] | null>(null);
  const [users, setUsers] = useState<User[] | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [hasNewFollow, setHasNewFollow] = useState(false);
  const { apiCall } = useGlobalAPIHelper();
  // const [popup, setPopup] = useState<{
  //   message: string;
  //   status: "success" | "failure";
  // } | null>(null);
  const [newFollowers, setNewFollowers] = useState<User[]>([]);

  const getData = async () => {
    try {
      const [profileData, followNotifData] = await Promise.all([
        apiCall({ type: "get-profiles" }, "POST", "getProfiles"),
        apiCall(
          { type: "check-new-follow-notification" },
          "POST",
          "getNewFollowNotification"
        ),
      ]);
      // console.log("ddd", followNotifData);

      if (profileData.error || followNotifData.error) {
        alert(profileData.error || followNotifData.error);
        return;
      }

      setCurrentUser(profileData.currentUser);
      setUsers(profileData.allUsers);
      setFollowRequests(profileData.followRequests);
      setHasNewFollow(followNotifData.hasNewFollow);
      setNewFollowers(followNotifData.newFollowers || []);
      return profileData;
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getData();
  }, []);

  // Filter users based on search term
  // console.log("Users", users);
  const filteredUsers = users?.filter(
    (user) =>
      user.nickname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.firstname?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // Handle accept follow request
  const handleAcceptRequest = async (userId: number) => {
    try {
      const data = await apiCall(
        { type: "accept-follow", data: { profileId: userId } },
        "POST",
        "acceptFollow"
      );
      if (data.error) {
        return;
      }

      setFollowRequests((prev) =>
        prev ? prev.filter((request) => request.id !== userId) : null
      );
    } catch (error) {
      console.log(error);
    }
  };

  // Handle decline follow request
  const handleDeclineRequest = async (userId: number) => {
    try {
      const data = await apiCall(
        {
          type: "delete-follow",
          data: { profileId: userId, IsFollower: false },
        },
        "POST",
        "deleteFollow"
      );
      if (data.error) {
        return;
      }

      setFollowRequests((prev) =>
        prev ? prev.filter((request) => request.id !== userId) : null
      );
    } catch (error) {
      console.log(error);
    }
  };

  // Navigate to user profile
  const navigateToProfile = async (id: number) => {
    try {
      await apiCall(
        { type: "delete-follow-notification", data: { profileId: id } },
        "POST",
        "deleteFollowNotif"
      );
    } catch (error) {
      console.error("Failed to delete notification:", error);
    }
    router.push(`/app/profiles/${id}`);
  };

  return (
    <div className="profile-container">
      <header className="profile-header">
        <h1>Profile</h1>
      </header>

      <section className="search-section">
        <div className="search-container">
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="search-input"
          />
          {searchTerm && (
            <button
              className="clear-search"
              onClick={() => setSearchTerm("")}
              aria-label="Clear search"
            >
              ×
            </button>
          )}
        </div>
      </section>

      {followRequests && followRequests.length > 0 && (
        <section className="follow-requests-section">
          <h2>Follow Requests</h2>
          <div className="follow-requests-list">
            {followRequests &&
              followRequests.map((request) => (
                <div key={request.id} className="user-card request-card">
                  <div
                    className="user-info"
                    onClick={() => navigateToProfile(request.id)}
                    style={{ cursor: "pointer" }}
                  >
                    <Image
                      src={
                        request.avatar
                          ? `http://localhost:8080/getProtectedImage?type=avatars&id=0&path=${encodeURIComponent(
                              request.avatar
                            )}`
                          : "/icons/placeholder.svg"
                      }
                      alt="user avatar"
                      width={40}
                      height={40}
                      className="user-avatar"
                      unoptimized
                    />
                    <div className="user-details">
                      <span className="user-name">{request.firstname}</span>
                      <span className="nickname">@{request.nickname}</span>
                    </div>
                  </div>
                  <div className="request-actions">
                    <button
                      className="accept-button"
                      onClick={() => handleAcceptRequest(request.id)}
                    >
                      Accept
                    </button>
                    <button
                      className="decline-button"
                      onClick={() => handleDeclineRequest(request.id)}
                    >
                      Decline
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </section>
      )}
      {hasNewFollow && newFollowers.length > 0 && (
        <div className="notification-banner">
          <p>🔔 You have new followers:</p>
          <ul className="followers-list">
            {newFollowers.map((follower) => (
              <li
                key={follower.id}
                onClick={() => navigateToProfile(follower.id)}
                style={{ cursor: "pointer" }}
              >
                <Image
                  src={
                    follower.avatar
                      ? `http://localhost:8080/getProtectedImage?type=avatars&id=${
                          follower.id
                        }&path=${encodeURIComponent(follower.avatar)}`
                      : "/icons/placeholder.svg"
                  }
                  alt="follower-avatar"
                  className="user-avatar"
                  width={25}
                  height={25}
                  unoptimized
                />
                <span className="user-name">
                  {follower.firstname} (@{follower.nickname}) followed you
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <section className="users-section">
        {currentUser && (
          <div className="current-user-section">
            <h2>Current User</h2>
            <div
              className="current-user-card"
              onClick={() => navigateToProfile(currentUser.id)}
              style={{ cursor: "pointer" }}
            >
              <Image
                src={
                  currentUser.avatar
                    ? `http://localhost:8080/getProtectedImage?type=avatars&id=0&path=${encodeURIComponent(
                        currentUser.avatar
                      )}`
                    : "/icons/placeholder.svg"
                }
                alt="user avatar"
                width={50}
                height={50}
                className="user-avatar"
                unoptimized
              />
              <div className="current-user-details">
                <span className="user-name">{currentUser.firstname}</span>
                <span className="nickname">@{currentUser.nickname}</span>
              </div>
            </div>
          </div>
        )}
        <h2>Browse Other Users</h2>

        <div className="users-list">
          {filteredUsers?.map((user) => (
            <div key={user.id} className="user-card">
              <div
                className="user-info"
                onClick={() => navigateToProfile(user.id)}
                style={{ cursor: "pointer" }}
              >
                <div
                  className="post-user-avatar"
                  onClick={() => router.push(`/app/profiles/${user.id}`)}
                >
                  <Image
                    src={
                      user.avatar
                        ? `http://localhost:8080/getProtectedImage?type=avatars&id=0&path=${encodeURIComponent(
                            user.avatar
                          )}`
                        : "/icons/placeholder.svg"
                    }
                    alt="user avatar"
                    width={40}
                    height={40}
                    className="user-avatar"
                    unoptimized
                  />
                </div>
                <div className="user-details">
                  <span className="user-name">{user.firstname}</span>
                  <span className="nickname">@{user.nickname}</span>
                </div>
              </div>
            </div>
          ))}
          {filteredUsers?.length === 0 && searchTerm && (
            <div className="no-results">
              No users found matching &quot;{searchTerm}&quot;
            </div>
          )}
        </div>
      </section>
      {/* {popup && (
        <Popup
          message={popup.message}
          status={popup.status}
          onClose={() => setPopup(null)}
        />
      )} */}
    </div>
  );
}
