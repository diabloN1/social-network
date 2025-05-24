"use client";

import type React from "react";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import "./styles.css";
import { User } from "./[id]/page";
import getProfiles from "@/api/profiles/getProfiles";
import acceptFollow from "@/api/follow/acceptFollow";
import deleteFollow from "@/api/follow/deleteFollow";

export default function ProfilesPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [followRequests, setFollowRequests] = useState<User[] | null>(null);
  const [users, setUsers] = useState<User[] | null>(null);

  const getData = async () => {
    try {
      const data = await getProfiles();
      if (data.error) {
        alert(data.error);
        return;
      }

      setUsers(data.allusers);
      setFollowRequests(data.followrequests);

      return data;
    } catch (error) {
      alert(error);
    }
  };

  useEffect(() => {
    getData();
  }, []);

  // Filter users based on search term
  const filteredUsers = users?.filter(
    (user) =>
      user.nickname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.firstname.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // Handle accept follow request
  const handleAcceptRequest = async (userId: number) => {
    try {
      const data = await acceptFollow(userId);
      if (data.error) {
        alert(data.error);
        return;
      }
      

      setFollowRequests((prev) =>
        prev ? prev.filter((request) => request.id !== userId) : null
      );
    } catch (error) {
      alert(error);
    }
  };

  // Handle decline follow request
  const handleDeclineRequest = async (userId: number) => {
    try {
      const data = await deleteFollow(userId, false);
      if (data.error) {
        alert(data.error);
        return;
      }
    
      setFollowRequests((prev) =>
        prev ? prev.filter((request) => request.id !== userId) : null
      );
    } catch (error) {
      alert(error);
    }
  };

  // Navigate to user profile
  const navigateToProfile = (id: number) => {
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
                    <img
                      src={request.avatar || "/icons/placeholder.svg"}
                      alt={request.nickname}
                      className="user-avatar"
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

      <section className="users-section">
        <h2>Browse Users</h2>
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
                  <img
                    src={
                      user.avatar
                        ? `http://localhost:8080/getProtectedImage?type=avatars&id=${
                            user.id
                          }&path=${encodeURIComponent(user.avatar)}`
                        : "/icons/placeholder.svg"
                    }
                    alt="user avatar"
                    className="user-avatar"
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
              No users found matching "{searchTerm}"
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
