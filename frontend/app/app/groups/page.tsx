"use client";

import type React from "react";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import "./styles.css";
import CreateGroupModal from "@/components/create-group-modal";
import createGroup from "@/api/groups/createGroup";
import getGroups from "@/api/groups/getGroups";
import requestJoinGroup from "@/api/groups/requestJoinGroup";
import respondToJoinRequest from "@/api/groups/respondeToJoinRequest";

// Types for API response
interface User {
  id: number;
  username: string;
  firstname: string;
  lastname: string;
  nickname: string;
  avatar?: string;
}

interface Group {
  id: number;
  title: string;
  description: string;
  owner_id: number;
  image: string;
  creation_date: string;
  is_accepted: boolean;
  is_owner: boolean;
  is_pending?: boolean;
  members: User[];
}

interface GroupInvite {
  id: number;
  group_id: number;
  user_id: number;
  creation_date: string;
  group: Group;
  user: User;
}

interface JoinRequest {
  id: number;
  title: string;
  description: string;
  image: string;
  creation_date: string;
  is_accepted: boolean;
  is_owner: boolean;
  members: User[];
}

interface GroupsData {
  all: Group[];
  error: string;
  group_invites: GroupInvite[] | null;
  join_requests: JoinRequest[] | null;
}

export default function GroupsPage() {
  const router = useRouter();
  const [groupsData, setGroupsData] = useState<GroupsData | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [showCreateModal, setShowCreateModal] = useState(false);

  const fetchGroupsData = async () => {
    try {
      const data = await getGroups();
      if (data.error) {
        alert(data.error);
        return;
      }

      console.log(data);
      setGroupsData(data);

      // Extract group IDs from join_requests to track pending requests
    } catch (error) {
      alert(error);
    }
  };

  useEffect(() => {
    fetchGroupsData();
  }, []);

  // Filter groups based on search term and active tab
  const filteredGroups = groupsData?.all?.filter((group) => {
    const matchesSearch =
      group.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      group.description.toLowerCase().includes(searchTerm.toLowerCase());

    if (activeTab === "all") return matchesSearch;
    if (activeTab === "my-groups") return matchesSearch && group.is_accepted;
    if (activeTab === "created") return matchesSearch && group.is_owner;

    return matchesSearch;
  });

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // Handle group creation
  const handleCreateGroup = async (group: {
    image: string;
    title: string;
    description: string;
  }) => {
    try {
      const data = await createGroup(group);
      if (data.error) {
        alert(data.error);
        return;
      }

      setShowCreateModal(false);
      // Refresh groups data
      fetchGroupsData();
    } catch (error) {
      alert(error);
    }
  };

  // Handle joining a group
  const handleJoinGroup = async (groupId: number) => {
    try {
      const data = await requestJoinGroup(groupId);
      if (data.error) {
        alert(data.error);
        return;
      }

      // Refresh groups data to update the is_pending status
      fetchGroupsData();
      console.log("Join request sent successfully");
    } catch (error) {
      alert(error);
    }
  };

  // Handle responding to invitations
  const handleInvitationResponse = (invitationId: number, accept: boolean) => {
    console.log(
      `${accept ? "Accepting" : "Declining"} invitation:`,
      invitationId
    );
  };

  // Handle responding to join requests (as group creator)
  const handleRequestResponse = async (
    userId: number,
    groupId: number,
    accept: boolean
  ) => {
    try {
      const data = await respondToJoinRequest(userId, groupId, accept);
      if (data.error) {
        alert(data.error);
        return;
      }
      fetchGroupsData();
    } catch (error) {
      alert(error);
    }
  };

  // Navigate to group detail page
  const navigateToGroup = (groupId: number) => {
    router.push(`/app/groups/${groupId}`);
  };

  return (
    <div className="groups-container">
      <header className="groups-header">
        <h1>Groups</h1>
        <button
          className="create-group-button"
          onClick={() => setShowCreateModal(true)}
        >
          Create Group
        </button>
      </header>

      <section className="search-section">
        <div className="search-container">
          <input
            type="text"
            placeholder="Search groups..."
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

      {/* Group Invitations Section */}
      {groupsData?.group_invites && groupsData.group_invites.length > 0 && (
        <section className="invitations-section">
          <h2>Group Invitations</h2>
          <div className="invitations-list">
            {groupsData.group_invites.map((invite) => (
              <div key={invite.id} className="invitation-card">
                <div className="invitation-info">
                  <img
                    src={
                      invite.user.avatar
                        ? `http://localhost:8080/getProtectedImage?type=avatars&id=${0}&path=${encodeURIComponent(
                            invite.user.avatar
                          )}`
                        : "/icons/placeholder.svg"
                    }
                    alt="user avatar"
                  />
                  <div className="invitation-details">
                    <span className="invitation-title">
                      <strong>{`${invite.user.firstname} ${invite.user.lastname}`}</strong>{" "}
                      invited you to join <strong>{invite.group.title}</strong>
                    </span>
                    <span className="invitation-description">
                      {invite.group.description}
                    </span>
                    <span className="invitation-date">
                      {new Date(invite.creation_date).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="invitation-actions">
                  <button
                    className="accept-button"
                    onClick={() => handleInvitationResponse(invite.id, true)}
                  >
                    Accept
                  </button>
                  <button
                    className="decline-button"
                    onClick={() => handleInvitationResponse(invite.id, false)}
                  >
                    Decline
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Join Requests Section (for group owners) */}
      {groupsData?.join_requests && groupsData.join_requests.length > 0 && (
        <section className="requests-section">
          <h2>Join Requests</h2>
          <div className="requests-list">
            {groupsData.join_requests.map((request) => (
              <div key={request.id} className="request-card">
                <div className="request-info">
                  <img
                    src={
                      request.members[0]?.avatar
                        ? `http://localhost:8080/getProtectedImage?type=avatars&id=${0}&path=${encodeURIComponent(
                            request.members[0]?.avatar
                          )}`
                        : "/icons/placeholder.svg"
                    }
                    alt="user avatar"
                  />
                  <div className="request-details">
                    <span className="request-title">
                      <strong>{`${request.members[0]?.firstname} ${request.members[0]?.lastname}`}</strong>{" "}
                      wants to join <strong>{request.title}</strong>
                    </span>
                    <span className="request-date">
                      {new Date(request.creation_date).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="request-actions">
                  <button
                    className="accept-button"
                    onClick={() =>
                      handleRequestResponse(
                        request.members[0]?.id,
                        request.id,
                        true
                      )
                    }
                  >
                    Accept
                  </button>
                  <button
                    className="decline-button"
                    onClick={() =>
                      handleRequestResponse(
                        request.members[0]?.id,
                        request.id,
                        false
                      )
                    }
                  >
                    Decline
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <div className="groups-tabs">
        <button
          className={`tab ${activeTab === "all" ? "active" : ""}`}
          onClick={() => setActiveTab("all")}
        >
          All Groups
        </button>
        <button
          className={`tab ${activeTab === "my-groups" ? "active" : ""}`}
          onClick={() => setActiveTab("my-groups")}
        >
          My Groups
        </button>
        <button
          className={`tab ${activeTab === "created" ? "active" : ""}`}
          onClick={() => setActiveTab("created")}
        >
          Created by Me
        </button>
      </div>

      <div className="groups-list">
        {filteredGroups && filteredGroups.length > 0 ? (
          filteredGroups.map((group) => (
            <div key={group.id} className="group-card">
              <div
                className="group-image"
                onClick={() => navigateToGroup(group.id)}
              >
                <img
                  src={
                    group.image
                      ? `http://localhost:8080/getProtectedImage?type=avatars&id=${0}&path=${encodeURIComponent(
                          group.image
                        )}`
                      : "/icons/placeholder.svg"
                  }
                  alt="group image"
                />
              </div>
              <div
                className="group-info"
                onClick={() => navigateToGroup(group.id)}
              >
                <h3 className="group-title">{group.title}</h3>
              </div>
              {!group.is_accepted && !group.is_pending && (
                <button
                  className="join-button"
                  onClick={() => handleJoinGroup(group.id)}
                >
                  Request to Join
                </button>
              )}
              {!group.is_accepted && group.is_pending && (
                <div className="member-badge requested">Request Pending</div>
              )}
              {group.is_accepted && <div className="member-badge">Member</div>}
            </div>
          ))
        ) : (
          <div className="no-groups-message">
            {searchTerm
              ? `No groups found matching "${searchTerm}"`
              : activeTab === "my-groups"
              ? "You haven't joined any groups yet"
              : activeTab === "created"
              ? "You haven't created any groups yet"
              : "No groups available"}
          </div>
        )}
      </div>

      {/* Create Group Modal */}
      {showCreateModal && (
        <CreateGroupModal
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateGroup}
        />
      )}
    </div>
  );
}
