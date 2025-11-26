import React, { useState, useEffect } from "react";
import "../styles/addToGroupModal.css";
import { useGroupApi } from "../hooks/useGroupApi";

export default function AddToGroupModal({
  movieId,
  mediaType,
  movieTitle,
  onClose,
  onSuccess
}) {
  const {
    myGroups,
    fetchMyGroups,
    addMovieToGroup,
    loading,
    error,
    showSuccess,
    showError
  } = useGroupApi();

  const [addingToGroup, setAddingToGroup] = useState(null);

  // Load user's groups when the modal opens
  useEffect(() => {
    fetchMyGroups();
  }, []);

  const handleAddToGroup = async (groupId, groupName) => {
    try {
      setAddingToGroup(groupId);

      const result = await addMovieToGroup(groupId, movieId, mediaType);

      if (!result || result.error) {
        showError(result?.error || "Failed to add movie to group");
        return;
      }

      showSuccess(`Added to ${groupName}!`);
      if (onSuccess) onSuccess(groupName);

    } catch (err) {
      console.error(err);
      showError("Unexpected error adding movie");
    } finally {
      setAddingToGroup(null);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-box add-to-group-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h3>Add to Group</h3>
          <button className="modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="modal-body">
          <p className="modal-movie-title">
            <strong>{movieTitle}</strong>
          </p>

          {/* Loading state */}
          {loading && (
            <div className="modal-loading">Loading your groups...</div>
          )}

          {/* Error state */}
          {error && (
            <div className="modal-error">
              <p>Error loading groups.</p>
              <button onClick={fetchMyGroups}>Retry</button>
            </div>
          )}

          {/* No groups */}
          {!loading && !error && myGroups.length === 0 && (
            <div className="modal-empty">
              <p>You don't have any groups yet.</p>
              <p className="modal-empty-hint">
                Create one from the Groups page first.
              </p>
            </div>
          )}

          {/* Groups list */}
          {!loading && !error && myGroups.length > 0 && (
            <div className="groups-list">
              {myGroups.map((group) => (
                <div key={group.id} className="group-item">
                  <div className="group-info">
                    <h4 className="group-name">{group.name}</h4>
                    {group.description && (
                      <p className="group-description">{group.description}</p>
                    )}
                  </div>

                  <button
                    className="add-btn"
                    disabled={addingToGroup === group.id}
                    onClick={() => handleAddToGroup(group.id, group.name)}
                  >
                    {addingToGroup === group.id ? "Adding..." : "Add"}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="modal-btn cancel" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}