import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserContext } from "../context/UserContext";
import "../styles/NavBar.css";

function Navbar() {
  const { user, setUser } = useContext(UserContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    setUser(null); 
    localStorage.removeItem("token"); 
    navigate("/"); 
  };

  const handleGamesClick = () => {
    localStorage.setItem("currentPage", 1); 
    navigate("/games"); 
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
