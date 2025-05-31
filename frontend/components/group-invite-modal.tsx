"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import getAvailableUsersToInvite from "@/api/groups/getAvailableUsersToInvite";
import inviteUserToGroup from "@/api/groups/inviteUserToGroup";
import "./group-invite-modal.css";

interface User {
  id: number;
  firstname: string;
  lastname: string;
  nickname: string;
  avatar: string;
}

interface GroupInviteModalProps {
  groupId: number;
  isOpen: boolean;
  onClose: () => void;
  onInviteSent?: () => void;
}

export default function GroupInviteModal({
  groupId,
  isOpen,
  onClose,
  onInviteSent,
}: GroupInviteModalProps) {
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [invitingUsers, setInvitingUsers] = useState<Set<number>>(new Set());

  const loadAvailableUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await getAvailableUsersToInvite(groupId);

      // console.log("data", data);
      if (data.error) {
        console.error("Error loading users:", data.error);
        setAvailableUsers([]);
        return;
      }

      setAvailableUsers(data.allusers || []);
    } catch (error) {
      console.error("Error loading available users:", error);
      setAvailableUsers([]);
    } finally {
      setIsLoading(false);
    }
  }, [groupId]);

  useEffect(() => {
    if (isOpen) {
      loadAvailableUsers();
    }
  }, [isOpen, groupId, loadAvailableUsers]);

  const handleInviteUser = async (userId: number) => {
    if (invitingUsers.has(userId)) return;

    try {
      setInvitingUsers((prev) => new Set(prev).add(userId));
      const data = await inviteUserToGroup(groupId, userId);

      if (data.error) {
        alert(data.error);
        return;
      }

      // Remove user from available users after successful invite
      setAvailableUsers((prev) => prev.filter((user) => user.id !== userId));

      if (onInviteSent) {
        onInviteSent();
      }

      alert("Invitation sent successfully!");
    } catch (error) {
      console.error("Error inviting user:", error);
      alert("Failed to send invitation");
    } finally {
      setInvitingUsers((prev) => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="group-invite-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Invite Users to Group</h2>
          <button className="close-btn" onClick={onClose}>
            <Image src="/icons/x.svg" alt="close" width={20} height={20} />
          </button>
        </div>

        <div className="modal-content">
          {isLoading ? (
            <div className="loading">Loading available users...</div>
          ) : (
            <div className="users-list">
              {availableUsers.length === 0 ? (
                <div className="no-users">No users available to invite</div>
              ) : (
                availableUsers.map((user) => (
                  <div key={user.id} className="user-item">
                    <div className="user-info">
                      <Image
                        src={
                          user.avatar
                            ? `http://localhost:8080/getProtectedImage?type=avatars&id=${
                                user.id
                              }&path=${encodeURIComponent(user.avatar)}`
                            : "/icons/placeholder.svg"
                        }
                        alt="user avatar"
                        className="user-avatar"
                        width={25}
                        height={25}
                        unoptimized
                      />
                      <div className="user-details">
                        <div className="user-name">
                          {user.firstname} {user.lastname}
                        </div>
                        {user.nickname && (
                          <div className="user-nickname">@{user.nickname}</div>
                        )}
                      </div>
                    </div>
                    <button
                      className="invite-btn"
                      onClick={() => handleInviteUser(user.id)}
                      disabled={invitingUsers.has(user.id)}
                    >
                      {invitingUsers.has(user.id) ? "Inviting..." : "Invite"}
                    </button>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
