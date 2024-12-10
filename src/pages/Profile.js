import React, { useContext, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { UserContext } from "../context/UserContext";
import axios from "axios";
import "../styles/Dashboard.css";

function Profile() {
  const { username } = useParams();
  const { user, setUser } = useContext(UserContext);
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState("profile");
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({ username: "", email: "", password: "" });
  const [createdForums, setCreatedForums] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [comments, setComments] = useState([]);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }

        const headers = { Authorization: `Bearer ${token}` };

        const res = await axios.get(`/api/users/${username}`, { headers });
        setFormData({ username: res.data.username, email: res.data.email, password: "" });

        const forumsRes = await axios.get(`/api/forum-posts/created-by/${user.user_id}`, { headers });
        setCreatedForums(forumsRes.data || []);

        const reviewsRes = await axios.get(`/api/reviews/user/${user.user_id}`, { headers });
        setReviews(reviewsRes.data || []);

        const commentsRes = await axios.get(`/api/comments/user/${user.user_id}`, { headers });
        setComments(commentsRes.data || []);

        setLoading(false);
      } catch (error) {
        console.error("Error fetching profile data:", error);
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [username, user, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      const updateData = { 
        email: formData.email, 
        newUsername: formData.username !== user.username ? formData.username : undefined, 
        password: formData.password || undefined 
      };

      const res = await axios.put(`/api/users/${username}`, updateData, { headers });

      // Update the UserContext and potentially reload the page
      if (updateData.newUsername) {
        setUser({ ...user, username: res.data.username });
        navigate(`/profile/${res.data.username}`); // Redirect to new username profile
      } else {
        setUser(res.data);
      }

      setEditMode(false);
    } catch (error) {
      console.error("Error updating user details:", error);
    }
  };

  const handleSectionClick = (section) => {
    setActiveSection(section);
  };

  if (loading) return <p>Loading profile...</p>;

  return (
    <div className="dashboard-container">
      <div className="sidebar">
        <h2>Dashboard</h2>
        <ul>
          <li>
            <button
              className={activeSection === "profile" ? "active" : ""}
              onClick={() => handleSectionClick("profile")}
            >
              Profile
            </button>
          </li>
          <li>
            <button
              className={activeSection === "forums" ? "active" : ""}
              onClick={() => handleSectionClick("forums")}
            >
              Forums
            </button>
          </li>
          <li>
            <button
              className={activeSection === "reviews" ? "active" : ""}
              onClick={() => handleSectionClick("reviews")}
            >
              Reviews
            </button>
          </li>
          <li>
            <button
              className={activeSection === "comments" ? "active" : ""}
              onClick={() => handleSectionClick("comments")}
            >
              Comments
            </button>
          </li>
        </ul>
      </div>

      <div className="main-content">
        {activeSection === "profile" && (
          <section id="profile" className="profile-section">
            <h1>User Profile</h1>
            <div className="profile-card">
              {editMode ? (
                <>
                  <label>
                    <strong>Username:</strong>
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleInputChange}
                    />
                  </label>
                  <label>
                    <strong>Email:</strong>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                    />
                  </label>
                  <label>
                    <strong>Password:</strong>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="Leave blank to keep current password"
                    />
                  </label>
                  <button onClick={handleSave}>Save</button>
                  <button onClick={() => setEditMode(false)}>Cancel</button>
                </>
              ) : (
                <>
                  <p><strong>Username:</strong> {formData.username}</p>
                  <p><strong>Email:</strong> {formData.email}</p>
                  <button onClick={() => setEditMode(true)}>Edit Profile</button>
                </>
              )}
            </div>
          </section>
        )}

        {activeSection === "forums" && (
          <section id="forums" className="activity-section">
            <h2>Forums Created</h2>
            {createdForums.length > 0 ? (
              createdForums.map((forum) => (
                <div key={forum.post_id} className="activity-item">
                  <a href={`/forum/${forum.title}`}>{forum.title}</a>
                  <p>{forum.body}</p>
                </div>
              ))
            ) : (
              <p>No forums created yet.</p>
            )}
          </section>
        )}

        {activeSection === "reviews" && (
          <section id="reviews" className="activity-section">
            <h2>Your Reviews</h2>
            {reviews.length > 0 ? (
              reviews.map((review) => (
                <div key={review.review_id} className="activity-item">
                  <a href={`/games/${review.rawg_id}`}>{review.game_title}</a>
                  <p>{review.review_text}</p>
                </div>
              ))
            ) : (
              <p>No reviews written yet.</p>
            )}
          </section>
        )}

        {activeSection === "comments" && (
          <section id="comments" className="activity-section">
            <h2>Your Comments</h2>
            {comments.length > 0 ? (
              comments.map((comment) => (
                <div key={comment.comment_id} className="activity-item">
                  <p>
                    <strong>Post:</strong>{" "}
                    <a href={`/forum/${encodeURIComponent(comment.post_title)}`}>{comment.post_title}</a>
                  </p>
                  <p>
                    <strong>Comment:</strong> {comment.content}
                  </p>
                  <small>Posted on: {new Date(comment.created_at).toLocaleString()}</small>
                </div>
              ))
            ) : (
              <p>No comments written yet.</p>
            )}
          </section>
        )}
      </div>
    </div>
  );
}

export default Profile;
