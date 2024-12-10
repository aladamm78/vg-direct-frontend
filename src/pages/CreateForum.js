import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/CreateForum.css";
import { BASE_URL } from "../services/api";

function CreateForum() {
  const [formData, setFormData] = useState({
    title: "",
    body: "",
    genreIds: [], // To handle selected genres
  });
  const [genres, setGenres] = useState([]); // Genres from the backend
  const [dropdownOpen, setDropdownOpen] = useState(false); // Manage dropdown visibility
  const navigate = useNavigate();

  // Decode the token to extract user_id
  const decodeToken = (token) => {
    try {
      const payload = JSON.parse(atob(token.split(".")[1])); // Decode JWT payload
      return payload;
    } catch (error) {
      console.error("Failed to decode token:", error);
      return null;
    }
  };

  // Fetch genres from the backend
  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const response = await fetch(`${BASE_URL}/api/genres`);
        if (!response.ok) {
          throw new Error("Failed to fetch genres");
        }
        const data = await response.json();
        setGenres(data);
      } catch (error) {
        console.error("Error fetching genres:", error.message);
      }
    };
    fetchGenres();
  }, []);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Toggle genre selection
  const handleGenreToggle = (genreId) => {
    setFormData((prevFormData) => {
      const isSelected = prevFormData.genreIds.includes(genreId);
      return {
        ...prevFormData,
        genreIds: isSelected
          ? prevFormData.genreIds.filter((id) => id !== genreId)
          : [...prevFormData.genreIds, genreId],
      };
    });
    setDropdownOpen(false); // Close dropdown after selection
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Get token from localStorage
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("No token found. Redirecting to home page.");
      navigate("/"); // Redirect to home if token is missing
      return;
    }

    // Decode token to extract user_id
    const userData = decodeToken(token);
    if (!userData || !userData.user_id) {
      console.error("Failed to extract user_id from token. Redirecting to home page.");
      navigate("/"); // Redirect to home if token is invalid
      return;
    }

    try {
      const response = await fetch(`${BASE_URL}/api/forum-posts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, 
        },
        body: JSON.stringify({
          title: formData.title,
          body: formData.body,
          genreIds: formData.genreIds,
          user_id: userData.user_id, 
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create forum post");
      }

      navigate("/forum"); // Redirect to forum page after successful creation
    } catch (error) {
      console.error("Error creating forum post:", error.message);
    }
  };

  return (
    <div className="create-forum-container">
      <h1>Create a New Forum Post</h1>
      <form onSubmit={handleSubmit}>
        <label>
          Title:
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
          />
        </label>
        <label>
          Body:
          <textarea
            name="body"
            value={formData.body}
            onChange={handleChange}
            required
          />
        </label>
        <label>
          Genre:
          <div className="dropdown">
            <button
              type="button"
              className="dropdown-toggle"
              onClick={() => setDropdownOpen((prev) => !prev)}
            >
              {formData.genreIds.length > 0
                ? `${formData.genreIds.length} selected`
                : "Select genres"}
            </button>
            {dropdownOpen && (
              <ul className="dropdown-menu">
                {genres.map((genre) => (
                  <li
                    key={genre.genre_id}
                    className={`dropdown-item ${
                      formData.genreIds.includes(genre.genre_id) ? "selected" : ""
                    }`}
                    onClick={() => handleGenreToggle(genre.genre_id)}
                  >
                    {genre.name}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </label>
        <button type="submit" className="submit-button">
          Submit
        </button>
      </form>
    </div>
  );
}

export default CreateForum;
