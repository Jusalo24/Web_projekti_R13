import React from "react";
import { useEffect, useState } from "react";
import "../styles/Account.css";


export default function Account() {
  const [profile, setProfile] = useState(null)
  const [favorites, setFavorites] = useState([])
  const [modalOpen, setModalOpen] = useState(false)
  const [newListTitle, setNewListTitle] = useState("")
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:3001";

const authHeaders = {
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("token")}`,
};

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const fetchProfile = async () => {
      try {
        const res = await fetch(`${API}/api/users/me`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
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
        const res = await fetch(`${API}/api/favorites`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        const data = await res.json();
        if (res.ok) {
          setFavorites(data);
        } else {
          setFavorites([]);
        }
      } catch (err) {
        console.error("Favorites error:", err);
      }
    };

    fetchProfile();
    fetchFavorites();
  }, []);



  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === "Escape") {
        setShowChangePassword(false);
        setShowDeleteConfirm(false);
        setModalOpen(false); // favorite list modal
      }
    };

    window.addEventListener("keydown", handleEsc);

    return () => {
      window.removeEventListener("keydown", handleEsc);
    };
  }, []);


  const handleCreateFavoriteList = async () => {
    if (!newListTitle.trim()) return

    const token = localStorage.getItem("token")

    try {
      const res = await fetch("/api/favorite-lists", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ title: newListTitle })
      })

      if (!res.ok) {
        console.error("Error creating list")
        return
      }

      const newList = await res.json()

      // Lisää lista UI:hin
      setLists(prev => [...prev, newList])
      setModalOpen(false)
      setNewListTitle("")

    } catch (err) {
      console.error("Create list error", err)
    }
  }

  const handlePasswordChange = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      alert("Please fill all fields.");
      return;
    }

    if (newPassword !== confirmPassword) {
      alert("New passwords do not match.");
      return;
    }

    // Password strength check
    if (!isValidPassword(newPassword)) {
      alert("Password must be at least 8 characters long and contain one uppercase letter and one number.");
      return;
    }

    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");

    const res = await fetch(`/api/users/${userId}/password`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({
        oldPassword,
        newPassword
      })
    });

    const data = await res.json();

    if (!res.ok) { alert(data.error); return; }

    alert("Password updated!");

    // Reset and close modal
    setShowChangePassword(false);
    setOldPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };


  const handleDeleteAccount = () => {
    console.log("Account deleted");

    // TODO: backend call here

    setShowDeleteConfirm(false);
  };




  return (
    <div className="account-container">

      {/* SIVUPANEELI */}
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

      {/* PÄÄSISÄLTÖ */}
      <main className="account-main">
        <h1>Your Profile</h1>

        {/* --- PROFILE INFO --- */}
        <section className="info-box">
          <h3>Name:</h3>
          <p>{profile ? profile.username : "Loading..."}</p>
        </section>

        {/* --- FAVORITES LIST --- */}
        <section className="info-box">
          <h3>Your Favorites</h3>

          <div className="home__movies-container">
            {favorites.length === 0 && <p>No favorites yet.</p>}

            {favorites.map((item) => (
              <div key={item.id} className="movie-card">
                <h4>{item.title}</h4>
                <p>{item.year}</p>
                <p>{item.type === "movie" ? "Movie" : "Series"}</p>
              </div>
            ))}
          </div>
        </section>

        {/* --- GROUPS --- */}
        <section className="info-box">
          <h3>Your Groups</h3>
          <ul className="list">
            <li>Group A</li>
          </ul>
        </section>
      </main>
      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h3>Create Favorite List</h3>

            <input type="text" placeholder="List name" value={newListTitle}
              onChange={(e) => setNewListTitle(e.target.value)}/>

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

      {showChangePassword && (
        <div className="modal-overlay" onClick={() => setShowChangePassword(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>

            <h3>Change Password</h3>

            <label>Old Password</label>
            <input type="password" value={oldPassword}
             onChange={(e) => setOldPassword(e.target.value)}/>

            <label>New Password</label>
            <input type="password" value={newPassword} 
              onChange={(e) => setNewPassword(e.target.value)}/>

            <label>Re-enter New Password</label>
            <input type="password" value={confirmPassword} 
              onChange={(e) => setConfirmPassword(e.target.value)}/>

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



    </div>
  )
}
