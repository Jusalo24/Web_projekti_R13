import React, { useState } from "react";
import { useGroupApi } from "../hooks/useGroupApi";
import GroupList from "../components/GroupList";
import Notification from "../components/Notification";
import "../styles/groups.css";

export default function Groups() {
  const [activeTab, setActiveTab] = useState("public");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupDescription, setNewGroupDescription] = useState("");

  const {
    groups,
    myGroups,
    joinRequests,
    loading,
    error,
    notification,
    createGroup,
    joinGroup,
    acceptJoin,
    rejectJoin,
    fetchGroups,
    fetchMyGroups,
    setNotification,
  } = useGroupApi();

  const handleCreateGroup = async () => {
    if (!newGroupName.trim()) {
      setNotification({
        message: "Group name is required",
        type: "error",
      });
      return;
    }

    const result = await createGroup(newGroupName, newGroupDescription);
    if (result) {
      setShowCreateModal(false);
      setNewGroupName("");
      setNewGroupDescription("");
      setActiveTab("my");
      fetchMyGroups(); // Refresh my groups
    }
  };

  const handleJoinGroup = async (groupId) => {
    await joinGroup(groupId);
  };

  const handleRetry = () => {
    if (activeTab === "public") {
      fetchGroups();
    } else if (activeTab === "my") {
      fetchMyGroups();
    }
  };

  return (
    <main className="groups-page">
      {/* Notification Display */}
      <Notification
        message={notification.message}
        type={notification.type}
        onClose={() => setNotification({ message: null, type: "error" })}
      />

      {/* Page Header */}
      <div className="groups-page__header">
        <h2 className="groups-page__title">Groups</h2>
        <button
          className="groups-page__create-btn"
          onClick={() => setShowCreateModal(true)}
        >
          + Create Group
        </button>
      </div>

      {/* Tabs */}
      <div className="groups-page__tabs">
        <button
          className={`groups-page__tab ${
            activeTab === "public" ? "groups-page__tab--active" : ""
          }`}
          onClick={() => setActiveTab("public")}
        >
          Public Groups
        </button>
        <button
          className={`groups-page__tab ${
            activeTab === "my" ? "groups-page__tab--active" : ""
          }`}
          onClick={() => setActiveTab("my")}
        >
          My Groups
        </button>
        <button
          className={`groups-page__tab ${
            activeTab === "requests" ? "groups-page__tab--active" : ""
          }`}
          onClick={() => setActiveTab("requests")}
        >
          Join Requests
          {joinRequests.length > 0 && (
            <span className="groups-page__badge">{joinRequests.length}</span>
          )}
        </button>
      </div>

      {/* Error Display */}
      {error && !loading && (
        <div className="groups-page__error">
          <div className="groups-page__error-icon">⚠️</div>
          <p className="groups-page__error-message">{error}</p>
          <button className="groups-page__error-retry" onClick={handleRetry}>
            Try Again
          </button>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="groups-page__loading">
          <div className="groups-page__spinner"></div>
          <p>Loading groups...</p>
        </div>
      )}

      {/* Content */}
      {!loading && !error && (
        <div className="groups-page__content">
          {activeTab === "public" && (
            <>
              {groups.length === 0 ? (
                <div className="groups-page__empty">
                  <div className="groups-page__empty-icon">👥</div>
                  <h3>No Public Groups Yet</h3>
                  <p>Be the first to create a group!</p>
                  <button
                    className="groups-page__empty-btn"
                    onClick={() => setShowCreateModal(true)}
                  >
                    Create First Group
                  </button>
                </div>
              ) : (
                <GroupList groups={groups} onJoin={handleJoinGroup} />
              )}
            </>
          )}

          {activeTab === "my" && (
            <>
              {myGroups.length === 0 ? (
                <div className="groups-page__empty">
                  <div className="groups-page__empty-icon">📂</div>
                  <h3>You Haven't Joined Any Groups Yet</h3>
                  <p>Browse public groups or create your own!</p>
                  <div className="groups-page__empty-actions">
                    <button
                      className="groups-page__empty-btn"
                      onClick={() => setActiveTab("public")}
                    >
                      Browse Groups
                    </button>
                    <button
                      className="groups-page__empty-btn groups-page__empty-btn--secondary"
                      onClick={() => setShowCreateModal(true)}
                    >
                      Create Group
                    </button>
                  </div>
                </div>
              ) : (
                <GroupList groups={myGroups} />
              )}
            </>
          )}

          {activeTab === "requests" && (
            <>
              {joinRequests.length === 0 ? (
                <div className="groups-page__empty">
                  <div className="groups-page__empty-icon">✉️</div>
                  <h3>No Pending Join Requests</h3>
                  <p>You'll see join requests for your groups here.</p>
                </div>
              ) : (
                <div className="groups-page__requests">
                  {joinRequests.map((req) => (
                    <div key={req.id} className="request-card">
                      <div className="request-card__info">
                        <span className="request-card__user">
                          {req.username || "Unknown User"}
                        </span>
                        <span className="request-card__text">
                          wants to join
                        </span>
                        <span className="request-card__group">
                          {req.groupName}
                        </span>
                      </div>
                      <div className="request-card__actions">
                        <button
                          onClick={() => acceptJoin(req.group_id, req.id)}
                          className="request-card__btn request-card__btn--accept"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => rejectJoin(req.group_id, req.id)}
                          className="request-card__btn request-card__btn--reject"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Create Group Modal */}
      {showCreateModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowCreateModal(false)}
        >
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-box__title">Create New Group</h3>

            <div className="modal-box__field">
              <label htmlFor="group-name">Group Name *</label>
              <input
                id="group-name"
                type="text"
                placeholder="Enter group name"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                className="modal-box__input"
                maxLength={200}
              />
            </div>

            <div className="modal-box__field">
              <label htmlFor="group-description">Description</label>
              <textarea
                id="group-description"
                placeholder="What's this group about? (optional)"
                value={newGroupDescription}
                onChange={(e) => setNewGroupDescription(e.target.value)}
                className="modal-box__textarea"
                rows={4}
              />
            </div>

            <div className="modal-box__buttons">
              <button
                className="modal-box__btn modal-box__btn--primary"
                onClick={handleCreateGroup}
              >
                Create Group
              </button>
              <button
                className="modal-box__btn modal-box__btn--secondary"
                onClick={() => setShowCreateModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
