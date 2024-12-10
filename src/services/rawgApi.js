import axios from "axios";

// const API_KEY = process.env.REACT_APP_RAWG_API_KEY; 
const BASE_URL = "https://vg-direct-backend.onrender.com/api"; 

// Fetch a list of games
export const fetchGames = async (query = "", page = 1, pageSize = 40) => {
    const response = await axios.get(`${BASE_URL}/games`, {
      params: { search: query, page, page_size: pageSize },
    });
    return response.data.results; // Return the games data
  };
