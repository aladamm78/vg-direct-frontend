// src/pages/Register.js
import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../context/UserContext";
import "../styles/AuthPages.css"

function Register() {
  const [formData, setFormData] = useState({ username: "", email: "", password: "" });
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { setUser } = useContext(UserContext);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null); // Clear any previous errors
    try {
      const response = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const { token } = await response.json();
        localStorage.setItem("token", token); // Store the token

        // Decode token and update UserContext
        try {
          const decodedToken = JSON.parse(atob(token.split(".")[1]));
          setUser({ username: decodedToken.username });
          navigate("/welcome"); // Redirect to the welcome page
        } catch (error) {
          console.error("Failed to decode token:", error);
          setError("Registration failed. Invalid token.");
        }
      } else {
        setError("Registration failed. Please try again.");
      }
    } catch (error) {
      console.error("Error registering:", error);
      setError("An unexpected error occurred. Please try again.");
    }
  };

  return (
    <div className="auth-container">
      <h1>Register</h1>
      <form onSubmit={handleSubmit}>
        <label>
          Username:
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
          />
        </label>
        <label>
          Email:
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
          />
        </label>
        <label>
          Password:
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
          />
        </label>
        <button type="submit">Register</button>
      </form>
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}

export default Register;
