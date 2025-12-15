import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import SearchBar from "./SearchBar";
import "../styles/index.css";
import "../styles/Navbar.css";

export default function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [showLogoutToast, setShowLogoutToast] = useState(false);

  const handleSearch = (query) => {
    if (!query) return;
    navigate(`/SearchResult?search=${encodeURIComponent(query)}`);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setShowLogoutToast(true);

    setTimeout(() => {
      navigate("/login");
      setShowLogoutToast(false);
    }, 1500);
  };

  return (
    <nav className="navbar">
      <div className="navbar__container">
        {/* Row 1: left spacer | centered logo | right auth */}
        <div className="navbar__spacer" />

        <Link to="/" className="navbar__logo">
          <h1>Movie Project</h1>
        </Link>

        <div className="navbar__auth">
         {/* Auth buttons */}
{token ? (
  <button
    className="navbar__logout-btn"
    onClick={handleLogout}
  >
    Logout
  </button>
) : (
  <button
    className="navbar__login-btn"
    onClick={() => navigate("/login")}
  >
    Login
  </button>
)}

        </div>

        {/* Row 2: links */}
        <ul className="navbar__links">
          <li className="navbar__link-item">
            <Link to="/" className="navbar__link">Home</Link>
          </li>
          <li className="navbar__link-item">
            <Link to="/discover" className="navbar__link">Discover</Link>
          </li>
          <li className="navbar__link-item">
            <Link to="/groups" className="navbar__link">Groups</Link>
          </li>
          <li className="navbar__link-item">
            <Link to="/account" className="navbar__link">Account</Link>
          </li>
        </ul>

        {/* Row 3: search */}
        <div className="navbar__search">
          <SearchBar onSearch={handleSearch} />
        </div>
      </div>

      {showLogoutToast && (
        <div className="logout-toast">
          You are now logged out
        </div>
      )}
    </nav>
  );
}
