import axios from "axios";

const apiClient = axios.create({
  baseURL: "https://vg-direct-backend.onrender.com/api",
});

const BASE_URL = process.env.REACT_APP_BACKEND_URL || "https://vg-direct-backend.onrender.com/api"; 
const API_BASE_URL = BASE_URL;

// Add or update a rating
const addOrUpdateRating = async (token, rawgId, score) => {
  try {
    const headers = { Authorization: `Bearer ${token}` };
    const data = { game_id: rawgId, score }; 

    const response = await axios.post(`${BASE_URL}/ratings`, data, { headers });
    return response.data;
  } catch (error) {
    console.error("Error adding/updating rating:", error);
    throw error;
  }
};

// Get average rating for a game
const getAverageRating = async (rawgId) => {
  try {
    // Use rawgId directly in the endpoint
    const response = await axios.get(`${BASE_URL}/ratings/${rawgId}/average-rating`);
    return response.data; // Ensure backend returns { averageRating: <value> }
  } catch (error) {
    if (error.response && error.response.status === 404) {
      // Log a normal message, not an error
      console.log(`No average rating found for rawg_id: ${rawgId}`);
      return { averageRating: 0 }; // Default to 0
    }
    // Re-throw other types of errors
    throw error;
  }
};

// Get a user's rating for a game
const getUserRating = async (rawgId, userId) => {
  try {
    // Use rawgId directly in the endpoint
    const response = await axios.get(`${BASE_URL}/ratings/${rawgId}/${userId}`);
    return response.data; // Response will include { score: <value or null> }
  } catch (error) {
    if (error.response && error.response.status === 404) {
      // Log a normal message, not an error
      console.log(`No user rating found for rawg_id: ${rawgId}, user_id: ${userId}`);
      return { score: null }; // Default score
    }
    // Re-throw other types of errors
    throw error;
  }
};

// Fetch or dynamically add a game using rawg_id
const fetchOrAddGame = async (rawgId) => {
  try {
    // Call the backend to fetch or add the game
    const response = await axios.get(`${BASE_URL}/games/${rawgId}`);
    return response.data; // Return the game details
  } catch (error) {
    console.error("Error fetching or adding game:", error.response?.data || error.message);
    throw error;
  }
};

// Define the getForumsCreatedByUser function
const getForumsCreatedByUser = async (userId, token) => {
  try {
    const headers = {
      Authorization: `Bearer ${token}`, // Add token for authentication
    };
    const response = await axios.get(`${API_BASE_URL}/forum-posts/created-by/${userId}`, {
      headers,
    });
    return response.data; // Return the list of forums
  } catch (error) {
    console.error("Error fetching forums created by user:", error.message);
    throw error; // Throw error to handle it in the calling component
  }
};

const fetchReviews = async (rawgId) => {
  const response = await fetch(`/api/reviews/${rawgId}`);
  return response.json();
};

const addReview = async (token, rawgId, reviewText) => {
  try {
    const response = await fetch(`/api/reviews`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ rawg_id: rawgId, review_text: reviewText }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to add review");
    }

    return await response.json();
  } catch (error) {
    console.error("Error adding review:", error.message);
    throw error;
  }
};



export async function fetchUserReviews(userId) {
  const response = await fetch(`/api/reviews/user/${userId}`);
  if (!response.ok) {
    throw new Error("Failed to fetch user reviews");
  }
  return await response.json();
}

// Edit an existing review
export async function editReview(reviewId, reviewText) {
  const token = localStorage.getItem("token");
  const response = await fetch(`/api/reviews/${reviewId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ review_text: reviewText }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to edit review");
  }

  return await response.json();
}

// Delete an existing review
export async function deleteReview(reviewId) {
  const token = localStorage.getItem("token");
  const response = await fetch(`/api/reviews/${reviewId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to delete review");
  }

  return await response.json();
}

// Fetch all comments by a specific user
export const getCommentsByUser = async (userId) => {
  try {
    const response = await axios.get(`${BASE_URL}/comments/user/${userId}`);
    return response.data; // Return the list of comments
  } catch (error) {
    console.error("Error fetching comments by user:", error.message);
    throw error;
  }
};


const searchGames = async (query) => {
  try {
    const response = await fetch(`${BASE_URL}/search?query=${encodeURIComponent(query)}`);
    if (!response.ok) {
      throw new Error(`Error: ${response.status} ${response.statusText}`);
    }
    const data = await response.json();
    return data; // Successfully return the game data
  } catch (error) {
    console.error("Error searching games:", error.message);
    return []; // Return an empty array as a fallback
  }
};

const updateUserProfile = async (username, data) => {
  const token = localStorage.getItem("token"); // Retrieve the token
  const headers = { Authorization: `Bearer ${token}` };

  try {
    const response = await axios.put(`/api/users/${username}`, data, { headers });
    return response.data; // Return updated user data
  } catch (error) {
    console.error("Error updating user profile:", error.response?.data || error.message);
    throw error;
  }
};

export { apiClient, addOrUpdateRating, getAverageRating, getUserRating, fetchOrAddGame, getForumsCreatedByUser, fetchReviews, addReview, searchGames, updateUserProfile };
