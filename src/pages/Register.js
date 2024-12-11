import React, { useState, useContext } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../context/UserContext";
import "../styles/AuthPages.css";
import { BASE_URL } from "../services/api";

function Register() {
  const [formData, setFormData] = useState({ username: "", email: "", password: "" });
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { setUser } = useContext(UserContext);
  
  const validateUsername = (username) => {
    const minLength = 3;
    const maxLength = 30;
    const regex = /^[a-zA-Z0-9_-]+$/;

    if (username.length < minLength) {
      return "Username must be at least 3 characters long.";
    }
    if (username.length > maxLength) {
      return "Username cannot exceed 30 characters.";
    }
    if (!regex.test(username)) {
      return "Username can only contain letters, numbers, underscores, or hyphens.";
    }
    return null;
  };

  const validatePassword = (password) => {
    const minLength = 8;
    const regex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    if (password.length < minLength) {
      return "Password must be at least 8 characters long.";
    }
    if (!regex.test(password)) {
      return "Password must include at least one letter, one number, and one special character.";
    }
    return null;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Form data:", formData);
    setError(null); // Clear any previous errors
  
    // Validate username before submitting
    const usernameError = validateUsername(formData.username);
    if (usernameError) {
      setError(usernameError);
      return;
    }
  
    // Validate password before submitting
    const passwordError = validatePassword(formData.password);
    if (passwordError) {
      setError(passwordError);
      return;
    }
  
    try {
      // Use axios for the request
      const response = await axios.post(`${BASE_URL}/api/auth/register`, formData, {
        headers: { "Content-Type": "application/json" },
      });
  
      // Handle the response
      if (response.status === 201) {
        const { token } = response.data;
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
      console.error("Error registering:", error.response?.data || error.message);
      setError(error.response?.data?.error || "An unexpected error occurred. Please try again.");
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
