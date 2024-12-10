import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../styles/Directory.css"; 

function Directory() {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState(""); 
  const [submittedQuery, setSubmittedQuery] = useState(""); // Query submitted for search
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Fetch games based on page or search query
  useEffect(() => {
    const fetchGames = async () => {
      setLoading(true);
      try {
        const endpoint = submittedQuery
          ? `https://api.rawg.io/api/games?key=9aa05b2ff77b476c8ff49505059dd4ed&search=${encodeURIComponent(submittedQuery)}&page=${page}`
          : `https://api.rawg.io/api/games?key=9aa05b2ff77b476c8ff49505059dd4ed&page=${page}`;

        const response = await fetch(endpoint);

        if (!response.ok) {
          throw new Error(`Error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();

        console.log("Fetched data:", data);

        setGames(data.results || []);
        setTotalPages(Math.ceil(data.count / 40)); 
      } catch (error) {
        console.error("Error fetching games:", error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchGames();
  }, [page, submittedQuery]);

  // Handle the "Search" button click
  const handleSearchSubmit = () => {
    setSubmittedQuery(searchQuery); // Trigger search with query
    setPage(1); // Reset to the first page when searching
  };

  // Pagination handlers
  const handleNextPage = () => {
    if (page < totalPages) {
      setPage((prev) => prev + 1);
    }
  };

  const handlePreviousPage = () => {
    if (page > 1) {
      setPage((prev) => prev - 1);
    }
  };
 
  if (loading) return <p>Loading games...</p>;

  return (
    <div>
      <h1>Game Directory</h1>

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

      {/* Games Display */}
      <div className="directory-container">
        {games && games.length > 0 ? (
          games.map((game) => (
            <div className="game-card" key={game.id}>
              <Link to={`/games/${game.id}`}>
                <img
                  src={game.background_image || "https://via.placeholder.com/150"}
                  alt={`${game.name} cover`}
                  className="game-image"
                />
                <h2>{game.name}</h2>
              </Link>
            </div>
          ))
        ) : (
          <p>No games found</p>
        )}
      </div>

      {/* Pagination Controls */}
      <div className="pagination-controls">
        <button onClick={handlePreviousPage} disabled={page === 1}>
          Previous
        </button>
        <span>Page {page} of {totalPages}</span>
        <button onClick={handleNextPage} disabled={page === totalPages}>
          Next
        </button>
      </div>
   </div>
  );
}

export default Directory;
