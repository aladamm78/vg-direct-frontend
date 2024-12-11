import React, { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserContext } from "../context/UserContext";
import "../styles/NavBar.css";

function Navbar({ onSearch }) {
  const { user, setUser } = useContext(UserContext);
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("token");
    navigate("/");
  };

  const handleGamesClick = () => {
    localStorage.setItem("currentPage", 1);
    navigate("/games");
  };

  const handleSearchSubmit = () => {
    onSearch(searchQuery);
    navigate("/games"); // Navigate to games page to display search results
  };

  return (
    <nav className="navbar">
      <div className="nav-left">
        <span className="nav-link clickable" onClick={handleGamesClick}>
          Games
        </span>
        <Link to="/forum" className="nav-link">
          Forum
        </Link>
        {user && (
          <Link to={`/profile/${user.username}`} className="nav-link">
            Dashboard
          </Link>
        )}
      </div>
      <Link to="/" className="navbar-brand">
        VG Direct
      </Link>
      <div className="nav-right">
        {/* Search Bar */}
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search for a game..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button onClick={handleSearchSubmit}>Search</button>
        </div>
        {user ? (
          <>
            <span className="welcome-message">{`Welcome, ${user.username}`}</span>
            <button onClick={handleLogout} className="logout-button">
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="nav-link">
              Login
            </Link>
            <Link to="/register" className="nav-link">
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;