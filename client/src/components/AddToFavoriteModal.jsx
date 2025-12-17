import React, { useState, useEffect } from "react";
import "../styles/addToGroupModal.css"; // Reuse same styles
import { useFavoritesApi } from "../hooks/useFavoritesApi";
import { useAuth } from "../context/AuthContext";

/**
 * Add to Favorite List Modal
 * Allows user to select which favorite list to add the movie to
 */
export default function AddToFavoriteModal({
  movieId,
  mediaType,
  movieTitle,
  onClose,
  onSuccess,
  onError
}) {
  const [favoriteLists, setFavoriteLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [addingToList, setAddingToList] = useState(null);

  const baseURL = import.meta.env.VITE_API_BASE_URL;
  const { token } = useAuth();
  const { getLists, showSuccess, showError } = useFavoritesApi(token);

  // Fetch user's favorite lists
  useEffect(() => {
    fetchFavoriteLists();
  }, []);

  // Close modal on Escape key for accessibility
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const fetchFavoriteLists = async () => {
    try {
      setLoading(true);
      // Require a valid token before calling protected endpoint
      if (!token) {
        setFavoriteLists([]);
        setError("Please login to view your favorite lists.");
        return;
      }

      const lists = await getLists();
      setFavoriteLists(lists || []);
      setError(null);
    } catch (err) {
      console.error("Error fetching favorite lists:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToList = async (listId, listTitle) => {
    try {
      setAddingToList(listId);

      const movieExternalId = `${mediaType}:${movieId}`;

      if (!token) {
        if (onError) onError("Please login to add items to favorite lists.");
        return;
      }

      const res = await fetch(`${baseURL}/api/favorite-lists/${listId}/items`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          movie_external_id: movieExternalId,
          position: 0
        })
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        const errorMsg = data.error || "Failed to add to favorite list";
        showError(errorMsg);
        if (onError) onError(errorMsg);
        return;
      }

      showSuccess(`Added to "${listTitle}"!`);
      if (onSuccess) onSuccess(listTitle);

    } catch (err) {
      console.error(err);
      if (onError) onError("Unexpected error adding to favorite list");
    } finally {
      setAddingToList(null);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-box add-to-group-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h3>Add to Favorite List</h3>
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
            <div className="modal-loading">Loading your lists...</div>
          )}

          {/* Error state */}
          {error && (
            <div className="modal-error">
              <p>{error}</p>
              <button onClick={fetchFavoriteLists}>Retry</button>
            </div>
          )}

          {/* No lists */}
          {!loading && !error && favoriteLists.length === 0 && (
            <div className="modal-empty">
              <p>You don't have any favorite lists yet.</p>
              <p className="modal-empty-hint">
                Create one from your Account page first.
              </p>
            </div>
          )}

          {/* Lists */}
          {!loading && !error && favoriteLists.length > 0 && (
            <div className="groups-list">
              {favoriteLists.map((list) => (
                <div key={list.id} className="group-item">
                  <div className="group-info">
                    <h4 className="group-name">{list.title}</h4>
                    {list.description && (
                      <p className="group-description">{list.description}</p>
                    )}
                  </div>

                  <button
                    type="button"
                    className="add-btn"
                    disabled={loading || addingToList === list.id}
                    onClick={() => handleAddToList(list.id, list.title)}
                  >
                    {addingToList === list.id ? "Adding..." : "Add"}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button type="button" className="modal-btn cancel" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}