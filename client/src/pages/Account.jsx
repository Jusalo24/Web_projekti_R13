import { useEffect, useState } from "react";
import "../styles/Account.css";


export default function Account() {
  const [profile, setProfile] = useState(null)
  const [favorites, setFavorites] = useState([])
  const [modalOpen, setModalOpen] = useState(false)
  const [newListTitle, setNewListTitle] = useState("")


  useEffect(() => {
    const token = localStorage.getItem("token")

    const fetchProfile = async () => {
      const res = await fetch("/api/users/me", {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      setProfile(data)
    }

    const fetchFavorites = async () => {
      const res = await fetch("/api/favorites", {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      setFavorites(data)
    }

    fetchProfile()
    fetchFavorites()
  }, [])

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


  return (
    <div className="account-container">

      {/* SIVUPANEELI */}
      <aside className="account-sidebar">
        <h2>Settings</h2>
        <button className="side-btn" onClick={() => setModalOpen(true)}>
          Create Favorite List
        </button>
        <button className="side-btn">Change Password</button>
        <button className="side-btn delete">Delete Account</button>
        
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
        <div className="modal-overlay">
          <div className="modal-box">
            <h3>Create Favorite List</h3>

            <input
              type="text"
              placeholder="List name"
              value={newListTitle}
              onChange={(e) => setNewListTitle(e.target.value)}
            />

            <div className="modal-buttons">
              <button
                className="modal-btn"
                onClick={handleCreateFavoriteList}
              >
                Create
              </button>

              <button
                className="modal-btn cancel"
                onClick={() => setModalOpen(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
