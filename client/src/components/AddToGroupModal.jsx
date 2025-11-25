import React, { useState, useEffect } from "react";
import "../styles/addToGroupModal.css";

export default function AddToGroupModal({ movieId, mediaType, movieTitle, onClose, onSuccess }) {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [addingToGroup, setAddingToGroup] = useState(null);

  const baseURL = import.meta.env.VITE_API_BASE_URL;
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchUserGroups();
  }, []);

  const fetchUserGroups = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${baseURL}/api/groups/my`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!res.ok) {
        throw new Error("Failed to fetch groups");
      }

      const data = await res.json();
      setGroups(data);
    } catch (err) {
      console.error("Error fetching groups:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToGroup = async (groupId, groupName) => {
    try {
      setAddingToGroup(groupId);
      
      const externalMovieId = `${mediaType}:${movieId}`;
      
      const res = await fetch(
        `${baseURL}/api/groups/${groupId}/movies?movieId=${encodeURIComponent(externalMovieId)}&mediaType=${mediaType}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to add movie to group");
      }

      onSuccess(groupName);
    } catch (err) {
      console.error("Error adding to group:", err);
      alert(err.message);
    } finally {
      setAddingToGroup(null);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box add-to-group-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Add to Group</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          <p className="modal-movie-title">
            <strong>{movieTitle}</strong>
          </p>

          {loading && (
            <div className="modal-loading">Loading your groups...</div>
          )}

          {error && (
            <div className="modal-error">
              <p>Error: {error}</p>
              <button onClick={fetchUserGroups}>Retry</button>
            </div>
          )}

          {!loading && !error && groups.length === 0 && (
            <div className="modal-empty">
              <p>You don't have any groups yet.</p>
              <p className="modal-empty-hint">
                Create a group first from the Groups page to add movies to it.
              </p>
            </div>
          )}

          {!loading && !error && groups.length > 0 && (
            <div className="groups-list">
              {groups.map((group) => (
                <div key={group.id} className="group-item">
                  <div className="group-info">
                    <h4 className="group-name">{group.name}</h4>
                    {group.description && (
                      <p className="group-description">{group.description}</p>
                    )}
                  </div>
                  <button
                    className="add-btn"
                    onClick={() => handleAddToGroup(group.id, group.name)}
                    disabled={addingToGroup === group.id}
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