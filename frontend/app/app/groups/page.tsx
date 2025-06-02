"use client";

import type React from "react";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import "./styles.css";
import CreateGroupModal from "@/components/create-group-modal";

import { useGlobalAPIHelper } from "@/helpers/GlobalAPIHelper";
import Popup from "../popup";
// import deleteNewEventNotification from "@/api/pass-groups/deleteNewEventNotification";
import Image from "next/image";
import { GroupsData } from "@/types/group";

// Types for API response

export default function GroupsPage() {
  const router = useRouter();
  const [groupsData, setGroupsData] = useState<GroupsData | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [popup, setPopup] = useState<{
    message: string;
    status: "success" | "failure";
  } | null>(null);

  const { apiCall } = useGlobalAPIHelper();

  const fetchGroupsData = async () => {
    try {
      const data = await apiCall({ type: "get-groups" }, "POST", "getGroups");
      if (data.error) {
        setPopup({ message: `${data.error}`, status: "failure" });
        return;
      }

      setGroupsData(data);
    } catch (error) {
      setPopup({ message: `${error}`, status: "failure" });
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
      const data = await apiCall(
        { type: "create-group", data: { ...group } },
        "POST",
        "createGroup"
      );
      if (data.error) {
        setPopup({ message: `${data.error}`, status: "failure" });
        return;
      }

      setShowCreateModal(false);
      // Refresh groups data
      fetchGroupsData();
    } catch (error) {
      setPopup({ message: `${error}`, status: "failure" });
    }
  };

  // Handle joining a group
  const handleJoinGroup = async (groupId: number) => {
    try {
      // const data = await requestJoinGroup(GroupId :groupId);
      const data = await apiCall(
        { type: "request-join-group", data: { GroupId: groupId } },
        "POST",
        "requestJoinGroup"
      );
      if (data.error) {
        setPopup({ message: `${data.error}`, status: "failure" });

        return;
      }

      // Refresh groups data to update the is_pending status
      fetchGroupsData();
    } catch (error) {
      setPopup({ message: `${error}`, status: "failure" });
    }
  };

  // Handle responding to invitations
  // Handle responding to invitations
  const handleInvitationResponse = async (groupId: number, accept: boolean) => {
    try {
      const data = await apiCall(
        {
          type: "respond-to-group-invitation",
          data: { GroupId: groupId, Accept: accept },
        },
        "POST",
        "respondToGroupInvitation"
      );
      if (data.error) {
        setPopup({ message: `${data.error}`, status: "failure" });
        return;
      }

      setPopup({
        message: `Invitation ${accept ? "accepted" : "declined"} successfully.`,
        status: "success",
      });

      // Refresh groups data to update UI
      fetchGroupsData();
    } catch (error) {
      setPopup({ message: `${error}`, status: "failure" });
    }
  };

  // Handle responding to join requests (as group creator)
  const handleRequestResponse = async (
    userId: number,
    groupId: number,
    accept: boolean
  ) => {
    try {
      const data = await apiCall(
        {
          type: "respond-to-join-request",
          data: { GroupId: groupId, UserId: userId, IsAccepted: accept },
        },
        "POST",
        "respondToJoinRequest"
      );
      if (data.error) {
        setPopup({ message: `${data.error}`, status: "failure" });

        return;
      }
      fetchGroupsData();
    } catch (error) {
      setPopup({ message: `${error}`, status: "failure" });
    }
  };

  // Navigate to group detail page

  const navigateToGroup = async (groupId: number) => {
    try {
      await apiCall(
        { type: "delete-new-event-notification", data: { GroupId: groupId } },
        "POST",
        "deleteNotifNewEvent"
      );
    } catch (error) {
      console.error("Failed to delete notification:", error);
    }
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
      {groupsData?.groupInvites && groupsData.groupInvites.length > 0 && (
        <section className="invitations-section">
          <h2>Group Invitations</h2>
          <div className="invitations-list">
            {groupsData.groupInvites.map((invite) => (
              <div key={invite.id} className="invitation-card">
                <div className="invitation-info">
                  <Image
                    src={
                      invite.inviter.avatar
                        ? `http://localhost:8080/getProtectedImage?type=avatars&id=0&path=${encodeURIComponent(
                            invite.inviter.avatar
                          )}`
                        : "/icons/placeholder.svg"
                    }
                    alt="user avatar"
                    className="user-avatar"
                    width={40}
                    height={40}
                    unoptimized
                  />
                  <div className="invitation-details">
                    <span className="invitation-title">
                      <strong>{`${invite.inviter.firstname} ${invite.inviter.lastname}`}</strong>{" "}
                      invited you to join <strong>{invite.title}</strong>
                    </span>
                    <span className="invitation-description">
                      {/* {invite.group.description} */}
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
      {groupsData?.joinRequests && groupsData.joinRequests.length > 0 && (
        <section className="requests-section">
          <h2>Join Requests</h2>
          <div className="requests-list">
            {groupsData.joinRequests.map((request) => (
              <div key={request.id} className="request-card">
                <div className="request-info">
                  <Image
                    src={
                      request.members[0]?.avatar
                        ? `http://localhost:8080/getProtectedImage?type=avatars&id=0&path=${encodeURIComponent(
                            request.members[0]?.avatar
                          )}`
                        : "/icons/placeholder.svg"
                    }
                    alt="user avatar"
                    width={40}
                    height={40}
                    unoptimized
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
                <Image
                  src={
                    group.image
                      ? `http://localhost:8080/getProtectedImage?type=avatars&id=0&path=${encodeURIComponent(
                          group.image
                        )}`
                      : "/icons/placeholder.svg"
                  }
                  alt="user avatar"
                  width={400}
                  height={200}
                  unoptimized
                />
              </div>
              {group.new_event && (
                <span className="event-notification-dot">New Event</span>
              )}
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
