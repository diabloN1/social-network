"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import getPostShares from "@/api/posts/getPostShares";
import addPostShare from "@/api/posts/addPostShare";
import removePostShare from "@/api/posts/removePostShare";
import "./post-share-modal.css";
import Popup from "@/app/app/popup";

interface User {
  id: number;
  firstname: string;
  lastname: string;
  nickname: string;
  avatar: string;
}

interface PostShareModalProps {
  postId: number;
  isOpen: boolean;
  onClose: () => void;
}

export default function PostShareModal({
  postId,
  isOpen,
  onClose,
}: PostShareModalProps) {
  const [currentShares, setCurrentShares] = useState<User[]>([]);
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"current" | "add">("current");
  const [popup, setPopup] = useState<{
    message: string;
    status: "success" | "failure";
  } | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadPostShares();
    }
  }, [isOpen, postId]);

  const loadPostShares = async () => {
    try {
      setIsLoading(true);
      const data = await getPostShares(postId);

      if (data.error) {
        alert(data.error);
        return;
      }

      setCurrentShares(data.data?.currentShares || []);
      setAvailableUsers(data.data?.availableUsers || []);
    } catch (error) {
      console.error("Error loading post shares:", error);
      setPopup({ message: "Failed to load post shares", status: "failure" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddUser = async (userId: number) => {
    try {
      const data = await addPostShare(postId, userId);

      if (data.error) {
        alert(data.error);
        return;
      }

      // Refresh the data
      await loadPostShares();
    } catch (error) {
      console.error("Error adding user:", error);
      setPopup({ message: "Failed to add user", status: "failure" });
    }
  };

  const handleRemoveUser = async (userId: number) => {
    try {
      const data = await removePostShare(postId, userId);

      if (data.error) {
        setPopup({ message: data.error, status: "failure" });
        return;
      }

      // Refresh the data
      await loadPostShares();
    } catch (error) {
      console.error("Error removing user:", error);
      setPopup({ message: "Failed to remove user", status: "failure" });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="post-share-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Manage Post Sharing</h2>
          <button className="close-btn" onClick={onClose}>
            <Image src="/icons/x.svg" alt="close" width={20} height={20} />
          </button>
        </div>

        <div className="modal-tabs">
          <button
            className={`tab-btn ${activeTab === "current" ? "active" : ""}`}
            onClick={() => setActiveTab("current")}
          >
            Current Access ({currentShares.length})
          </button>
          <button
            className={`tab-btn ${activeTab === "add" ? "active" : ""}`}
            onClick={() => setActiveTab("add")}
          >
            Add Users ({availableUsers.length})
          </button>
        </div>

        <div className="modal-content">
          {isLoading ? (
            <div className="loading">Loading...</div>
          ) : (
            <>
              {activeTab === "current" && (
                <div className="users-list">
                  {currentShares.length === 0 ? (
                    <div className="no-users">
                      No users have access to this post yet
                    </div>
                  ) : (
                    currentShares.map((user) => (
                      <div key={user.id} className="user-item">
                        <div className="user-info">
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
                          <div className="user-details">
                            <div className="user-name">
                              {user.firstname} {user.lastname}
                            </div>
                            {user.nickname && (
                              <div className="user-nickname">
                                @{user.nickname}
                              </div>
                            )}
                          </div>
                        </div>
                        <button
                          className="remove-btn"
                          onClick={() => handleRemoveUser(user.id)}
                        >
                          Remove
                        </button>
                      </div>
                    ))
                  )}
                </div>
              )}

              {activeTab === "add" && (
                <div className="users-list">
                  {availableUsers.length === 0 ? (
                    <div className="no-users">
                      No more followers available to share with
                    </div>
                  ) : (
                    availableUsers.map((user) => (
                      <div key={user.id} className="user-item">
                        <div className="user-info">
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
                          <div className="user-details">
                            <div className="user-name">
                              {user.firstname} {user.lastname}
                            </div>
                            {user.nickname && (
                              <div className="user-nickname">
                                @{user.nickname}
                              </div>
                            )}
                          </div>
                        </div>
                        <button
                          className="add-btn"
                          onClick={() => handleAddUser(user.id)}
                        >
                          Add
                        </button>
                      </div>
                    ))
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
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
