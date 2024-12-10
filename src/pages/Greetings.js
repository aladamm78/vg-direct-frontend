import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Greeting.css"

function Greeting() {
  const navigate = useNavigate();

  // Mock username retrieval
  const username = localStorage.getItem("username") || "Guest";

  return (
    <div className="container">
      <h1 className="heading">Welcome back, {username}!</h1>
      <p className="text">Browse your favorite games.</p>
      <button
        onClick={() => navigate("/games")}
        className="button"
      >
        Visit Game Library
      </button>
    </div>
  );
}

export default Greeting;
