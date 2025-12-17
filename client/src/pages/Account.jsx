import React from "react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Trash2, Share2 } from "lucide-react";
import GetImage from "../components/GetImage";
import ShareModal from "../components/ShareModal";
import { useShareApi } from "../hooks/useShareApi";
import { useAuth } from "../context/AuthContext";
import "../styles/Account.css";

export default function Account() {
  const [profile, setProfile] = useState(null);
  const [favoriteLists, setFavoriteLists] = useState([]);
  const [loadingFavorites, setLoadingFavorites] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [newListTitle, setNewListTitle] = useState("");
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [deleteSuccess, setDeleteSuccess] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [selectedList, setSelectedList] = useState(null);
  const [listItems, setListItems] = useState([]);
  const [showListModal, setShowListModal] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState(null);
  
  // Share functionality
  const [showShareModal, setShowShareModal] = useState(false);
  const [listToShare, setListToShare] = useState(null);

  const baseURL = import.meta.env.VITE_API_BASE_URL;
  const navigate = useNavigate();
  const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:3001";
  const { token, refreshAccessToken, logout } = useAuth();

  const { notification: shareNotification, setNotification: setShareNotification } = useShareApi(token);

  const authHeaders = token ? {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  } : { "Content-Type": "application/json" };

  useEffect(() => {
    (async () => {
      if (!token) {
        await refreshAccessToken()
      }

      if (!token) {
        navigate("/login");
        return;
      }

      fetchProfile();
      fetchFavorites();
    })()
  }, [token]);

  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === "Escape") {
        setShowChangePassword(false);
        setShowDeleteConfirm(false);
        setModalOpen(false);
        setShowListModal(false);
        setShowShareModal(false);
      }
    };

    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await fetch(`${API}/api/users/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await res.json();
      if (res.ok) {
        setProfile(data);
      } else {
        console.error("Profile fetch error:", data);
      }
    } catch (err) {
      console.error("Profile error:", err);
    }
  };

  const fetchFavorites = async () => {
    try {
      setLoadingFavorites(true);
      
      const listsRes = await fetch(`${API}/api/favorite-lists`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!listsRes.ok) {
        setLoadingFavorites(false);
        return;
      }

      const lists = await listsRes.json();
      setFavoriteLists(lists);
    } catch (err) {
      console.error("Favorites error:", err);
    } finally {
      setLoadingFavorites(false);
    }
  };

  const handleCreateFavoriteList = async () => {
    if (!newListTitle.trim()) return;

    try {
      const res = await fetch(`${API}/api/favorite-lists`, {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({ 
          title: newListTitle,
          description: "My favorite movies and shows"
        })
      });

      if (!res.ok) {
        console.error("Error creating list");
        return;
      }

      const newList = await res.json();
      setFavoriteLists(prev => [...prev, newList]);
      setModalOpen(false);
      setNewListTitle("");
    } catch (err) {
      console.error("Create list error", err);
    }
  };

  const handlePasswordChange = async () => {
    setPasswordError("");

    if (!oldPassword || !newPassword || !confirmPassword) {
      setPasswordError("Please fill all fields.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }

    if (newPassword.length < 8 || !/[A-Z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
      setPasswordError("Password must be 8+ chars, 1 uppercase letter, and 1 number.");
      return;
    }

    try {
      const userId = profile.id;
      const res = await fetch(`${API}/api/users/${userId}/password`, {
        method: "PUT",
        headers: authHeaders,
        body: JSON.stringify({ oldPassword, newPassword })
      });

      const data = await res.json();

      if (!res.ok) {
        setPasswordError(data.error || "Failed to update password");
        return;
      }

      setPasswordSuccess(true);

      setTimeout(() => {
        setShowChangePassword(false);
        setPasswordSuccess(false);
      }, 2000);

      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");

    } catch (err) {
      setPasswordError("Server error while updating password");
    }
  };

  const handleDeleteAccount = async () => {
    if (!profile) return;

    try {
      const res = await fetch(`${API}/api/users/${profile.id}`, {
        method: "DELETE",
        headers: authHeaders
      });

      const data = await res.json();

      if (!res.ok) {
        console.error("Delete failed:", data.error);
        return;
      }

      setDeleteSuccess(true);

      await logout();

      setTimeout(() => {
        setDeleteSuccess(false);
        navigate("/login");
      }, 2000);

    } catch (err) {
      console.error("Delete error:", err);
    }

    setShowDeleteConfirm(false);
  };

  const openList = async (list) => {
    setSelectedList(list);
    setShowListModal(true);

    try {
      const res = await fetch(`${API}/api/favorite-lists/${list.id}/items`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) {
        console.error("Failed to load list items");
        return;
      }

      const items = await res.json();

      const detailedItems = [];

      for (const item of items) {
        const [mediaType, movieId] = item.movie_external_id.split(":");

        try {
          const endpoint =
            mediaType === "tv"
              ? `${API}/api/tv/${movieId}`
              : `${API}/api/movies/byId/${movieId}`;

          const movieRes = await fetch(endpoint);
          if (movieRes.ok) {
            const movieData = await movieRes.json();
            detailedItems.push({
              ...movieData,
              media_type: mediaType,
              item_id: item.id
            });
          }
        } catch (err) {
          console.error("Error fetching movie details:", err);
        }
      }

      setListItems(detailedItems);
    } catch (err) {
      console.error("List load error:", err);
    }
  };

  const handleRemoveFromList = async (itemId) => {
    try {
      await fetch(`${baseURL}/api/favorite-lists/items/${itemId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setListItems((prev) =>
        prev.filter((item) => item.item_id !== itemId)
      );

      setConfirmMessage("Delete confirmed");
      setTimeout(() => setConfirmMessage(null), 2500);
    } catch (err) {
      console.error("Failed to remove item", err);
    }
  };

  // Share functionality handlers
  const handleShareClick = (list) => {
    setListToShare(list);
    setShowShareModal(true);
  };

  const handleCloseShareModal = () => {
    setShowShareModal(false);
    setListToShare(null);
  };

  return (
    <div className="account-container">
      
      {/* Share Notification */}
      {shareNotification.message && (
        <div className={`toast toast--${shareNotification.type}`}>
          {shareNotification.message}
        </div>
      )}

      <aside className="account-sidebar">
        <h2>Settings</h2>
        <button className="side-btn" onClick={() => setModalOpen(true)}>
          Create Favorite List
        </button>
        <button className="side-btn" onClick={() => setShowChangePassword(true)}>
          Change Password
        </button>
        <button className="side-btn delete" onClick={() => setShowDeleteConfirm(true)}>
          Delete Account
        </button>
      </aside>

      {confirmMessage && (
        <div className="toast toast--success">
          {confirmMessage}
        </div>
      )}

      <main className="account-main">
        <h1>Your Profile</h1>

        <section className="info-box">
          <h3>Username:</h3>
          <p>{profile ? profile.username : "Loading..."}</p>
        </section>

        <section className="info-box">
          <h3>Email:</h3>
          <p>{profile ? profile.email : "Loading..."}</p>
        </section>

        {favoriteLists.length > 0 && (
          <section className="info-box">
            <h3>Your Favorite Lists ({favoriteLists.length})</h3>
            <ul className="list">
              {favoriteLists.map(list => (
                <li key={list.id} className="favorite-list-item">
                  <span 
                    className="clickable-list"
                    onClick={() => openList(list)}
                  >
                    {list.title}
                  </span>
                  <button
                    className="share-list-btn"
                    onClick={() => handleShareClick(list)}
                    title="Share this list"
                  >
                    <Share2 size={18} />
                    Share
                  </button>
                </li>
              ))}
            </ul>
          </section>
        )}
      </main>

      {/* CREATE LIST MODAL */}
      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h3>Create Favorite List</h3>
            <input 
              type="text" 
              placeholder="List name" 
              value={newListTitle}
              onChange={(e) => setNewListTitle(e.target.value)}
            />
            <div className="modal-buttons">
              <button className="modal-btn" onClick={handleCreateFavoriteList}>
                Create
              </button>
              <button className="modal-btn cancel" onClick={() => setModalOpen(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CHANGE PASSWORD MODAL */}
      {showChangePassword && (
        <div className="modal-overlay" onClick={() => setShowChangePassword(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h3>Change Password</h3>
            <label>Old Password</label>
            <input 
              type="password" 
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
            />
            <label>New Password</label>
            <input 
              type="password" 
              value={newPassword} 
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <label>Re-enter New Password</label>
            <input 
              type="password" 
              value={confirmPassword} 
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <div className="modal-buttons">
              <button className="modal-btn" onClick={handlePasswordChange}>
                Apply
              </button>
              <button className="modal-btn cancel" onClick={() => setShowChangePassword(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE ACCOUNT MODAL */}
      {showDeleteConfirm && (
        <div className="modal-overlay" onClick={() => setShowDeleteConfirm(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h3>Delete Account</h3>
            <p>Are you sure you want to delete your account?</p>
            <div className="modal-buttons">
              <button className="modal-btn" onClick={handleDeleteAccount}>
                Confirm
              </button>
              <button className="modal-btn cancel" onClick={() => setShowDeleteConfirm(false)}>
                No
              </button>
            </div>
          </div>
        </div>
      )}

      {/* LIST ITEMS MODAL */}
      {showListModal && (
        <div className="modal-overlay" onClick={() => setShowListModal(false)}>
          <div className="modal-box modal-box--favorites" onClick={(e) => e.stopPropagation()}>
            <h3>{selectedList?.title}</h3>

            {listItems.length === 0 ? (
              <p>No movies in this list yet.</p>
            ) : (
              <div className="favorites-grid">
                {listItems.map((movie) => (
                  <div
                    key={movie.item_id}
                    className="favorite-card"
                    onClick={() =>
                      navigate(`/movies/${movie.id}?type=${movie.media_type}`)
                    }
                  >
                    <button
                      className="favorite-card__remove"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveFromList(movie.item_id);
                      }}
                    >
                      <Trash2 size={24}/>
                    </button>

                    <div className="favorite-card__poster">
                      {movie.poster_path ? (
                        <GetImage
                          path={movie.poster_path}
                          title={movie.title || movie.name}
                          size="w342"
                        />
                      ) : (
                        <div className="favorite-card__placeholder">No Image</div>
                      )}
                    </div>
                    <div className="favorite-card__info">
                      <h4 className="favorite-card__title">
                        {movie.title || movie.name}
                      </h4>
                      <div className="favorite-card__meta">
                        <span className="favorite-card__type">
                          {movie.media_type === "tv" ? "TV Show" : "Movie"}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <button className="modal-btn cancel" onClick={() => setShowListModal(false)}>
              Close
            </button>
          </div>
        </div>
      )}

      {/* SHARE MODAL */}
      {showShareModal && listToShare && (
        <ShareModal
          list={listToShare}
          onClose={handleCloseShareModal}
          token={token}
        />
      )}

      {deleteSuccess && (
        <div className="success-toast">
          Account deleted successfully!
        </div>
      )}

      {passwordSuccess && (
         <div className="success-toast">Password updated successfully!</div>
      )}

      {passwordError && (
         <div className="error-toast">{passwordError}</div>
      )}
    </div>
  );
}
