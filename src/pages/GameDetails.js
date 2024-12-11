import React, { useEffect, useState, useContext } from "react";
import { useParams } from "react-router-dom";
import {
  fetchOrAddGame,
  addOrUpdateRating,
  getAverageRating,
  fetchReviews,
  addReview,
  editReview,
  deleteReview,
} from "../services/api";
import { UserContext } from "../context/UserContext";
import "../styles/GameDetails.css";

function GameDetails() {
  const { id: rawgId } = useParams();
  const { user } = useContext(UserContext);
  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);
  const [averageRating, setAverageRating] = useState(null);
  const [userRating, setUserRating] = useState(null);
  const [showRatingForm, setShowRatingForm] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [userReview, setUserReview] = useState(null);
  const [newReviewText, setNewReviewText] = useState("");
  const [isEditingReview, setIsEditingReview] = useState(false);
  const [editReviewText, setEditReviewText] = useState("");
  const [newRating, setNewRating] = useState("");
  const [showReviewForm, setShowReviewForm] = useState(false);

  const userToken = localStorage.getItem("token");

  // Fetch game details
  useEffect(() => {
    const fetchGameDetails = async () => {
      try {
        const url = `${process.env.REACT_APP_BACKEND_URL}/games/${rawgId}`;
        console.log("Fetching game details from:", url);
  
        const data = await fetchOrAddGame(rawgId); // Ensure fetchOrAddGame is properly using /api
        console.log("Game details fetched successfully:", data);
  
        setGame(data);
        setAverageRating(data.average_rating || null);
      } catch (error) {
        console.error("Error fetching or adding game:", error);
      } finally {
        setLoading(false);
      }
    };
  
    fetchGameDetails();
  }, [rawgId]);

  // Fetch reviews
  useEffect(() => {
    const fetchGameReviews = async () => {
      try {
        const data = await fetchReviews(rawgId);
        setReviews(data); 

        if (user) {
          const existingReview = data.find((review) => review.user_id === user.user_id);
          setUserReview(existingReview || null);
        }
      } catch (error) {
        console.error("Error fetching reviews:", error);
      }
    };

    fetchGameReviews();
  }, [rawgId, user]);

  const handleSubmitRating = async (e) => {
    e.preventDefault();
  
    if (!userToken) {
      alert("You must be logged in to submit a rating!");
      return;
    }
  
    const numericRating = parseInt(newRating, 10); // Convert newRating to a number
  
    if (numericRating < 1 || numericRating > 10) {
      alert("Rating must be between 1 and 10.");
      return;
    }
  
    try {
      await addOrUpdateRating(userToken, rawgId, numericRating);
      alert("Your rating has been submitted!");
  
      const data = await getAverageRating(rawgId);
      setAverageRating(data.averageRating);
      setUserRating(numericRating); // Update the user's actual rating
      setNewRating(""); // Clear temporary input state
      setShowRatingForm(false);
    } catch (error) {
      console.error("Error submitting rating:", error);
    }
  };
  

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!newReviewText.trim()) {
        alert("Review text cannot be empty.");
        return;
      }

      const token = localStorage.getItem("token");
      if (!token) {
        alert("You must be logged in to submit a review!");
        return;
      }

      await addReview(token, rawgId, newReviewText);
      alert("Your review has been submitted!");

      const data = await fetchReviews(rawgId);
      setReviews(data);

      if (user) {
        const existingReview = data.find((review) => review.user_id === user.user_id);
        setUserReview(existingReview || null);
      }

      setNewReviewText("");
    } catch (error) {
      console.error("Error submitting review:", error.message);
      alert("Failed to submit review. Please try again.");
    }
  };

  const handleEditReviewSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!editReviewText.trim()) {
        alert("Review text cannot be empty.");
        return;
      }

      await editReview(userReview.review_id, editReviewText);
      alert("Your review has been updated!");

      const data = await fetchReviews(rawgId);
      setReviews(data);

      if (user) {
        const existingReview = data.find((review) => review.user_id === user.user_id);
        setUserReview(existingReview || null);
      }

      setIsEditingReview(false);
    } catch (error) {
      console.error("Error editing review:", error);
      alert("Failed to edit review. Please try again.");
    }
  };

  const handleDeleteReview = async () => {
    try {
      await deleteReview(userReview.review_id);
      alert("Your review has been deleted!");

      const data = await fetchReviews(rawgId);
      setReviews(data);

      setUserReview(null);
    } catch (error) {
      console.error("Error deleting review:", error);
      alert("Failed to delete review. Please try again.");
    }
  };

  if (loading) return <p>Loading game details...</p>;


  return (
    <div className="game-details-container">
      <h1>{game.title}</h1>
      {game.image_url && <img src={game.image_url} alt={game.title} className="game-image" />}
  
      <div className="rating-section">
        <p>
          <strong>Average Rating:</strong>{" "}
          {averageRating === null || averageRating === 0
            ? "No Reviews Yet..."
            : parseFloat(averageRating).toFixed(1)}
        </p>
  
        {user ? (
          userRating !== null ? (
            <div>
              <p>Your Rating: {userRating}</p>
              <button onClick={() => setShowRatingForm(true)}>Edit Rating</button>
            </div>
          ) : (
            <button onClick={() => setShowRatingForm(true)}>Rate It</button>
          )
        ) : (
          <button onClick={() => alert("You need to be logged in to submit a rating!")}>
            Rate It
          </button>
        )}
      </div>
  
      {user ? (
        showRatingForm && (
          <div className="rating-form">
            <h3>Submit Your Rating</h3>
            <form onSubmit={handleSubmitRating}>
              <label htmlFor="userRating">Your Rating (1-10):</label>
              <input
                id="userRating"
                type="number"
                min="1"
                max="10"
                value={newRating}
                onChange={(e) => setNewRating(e.target.value)}
                required
              />
              <button type="submit">Submit</button>
            </form>
          </div>
        )
      ) : (
        <div className="center-text">
          <p>Please log in to submit a rating!</p>
        </div>
      )}
  
      {game.description && (
        <p>
          <strong>Description:</strong> {game.description}
        </p>
      )}
      {game.release_year && <p><strong>Release Year:</strong> {game.release_year}</p>}
      {game.platform && <p><strong>Platforms:</strong> {game.platform}</p>}
      {game.genre && <p><strong>Genres:</strong> {game.genre}</p>}
      {game.developer && <p><strong>Developer:</strong> {game.developer}</p>}
  
      <section className="reviews-section">
        <h2>All Reviews</h2>
        {reviews.length > 0 ? (
          reviews.map((review) => (
            <div key={review.review_id} className="review">
              <p>
                <strong>{review.username}:</strong> {review.review_text}
              </p>
              <small>Posted on: {new Date(review.created_at).toLocaleDateString()}</small>
            </div>
          ))
        ) : (
          <p>No reviews yet. Be the first to write one!</p>
        )}
      </section>
  
      <section className="user-review-section">
        <h2>Your Review</h2>
        {user ? (
          userReview ? (
            <div className="existing-review">
              <p>{userReview.review_text}</p>
              <button
                onClick={() => {
                  setIsEditingReview(true);
                  setEditReviewText(userReview.review_text);
                }}
              >
                Edit Review
              </button>
              <button onClick={handleDeleteReview}>Delete Review</button>
            </div>
          ) : (
            <>
              {!showReviewForm ? (
                <button onClick={() => setShowReviewForm(true)}>Write a Review</button>
              ) : (
                <form onSubmit={handleReviewSubmit} className="review-form">
                  <textarea
                    value={newReviewText}
                    onChange={(e) => setNewReviewText(e.target.value)}
                    placeholder="Share your thoughts about the game..."
                    required
                  />
                  <div className="review-form-buttons">
                    <button type="submit">Submit Review</button>
                    <button type="button" onClick={() => setShowReviewForm(false)}>Cancel</button>
                  </div>
                </form>
              )}
            </>
          )
        ) : (
          <button onClick={() => alert("You need to be logged in to write a review!")}>
            Write a Review
          </button>
        )}
  
        {isEditingReview && (
          <form onSubmit={handleEditReviewSubmit} className="review-form">
            <textarea
              value={editReviewText}
              onChange={(e) => setEditReviewText(e.target.value)}
              placeholder="Update your review here..."
              required
            />
            <div className="review-form-buttons">
              <button type="submit">Save Changes</button>
              <button type="button" onClick={() => setIsEditingReview(false)}>Cancel</button>
            </div>
          </form>
        )}
      </section>
    </div>
  );
  

}
export default GameDetails;
