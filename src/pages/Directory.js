import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../styles/Directory.css";

function Directory() {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [page, setPage] = useState(() => {
    // Retrieve the page number from local storage or default to 1
    const savedPage = localStorage.getItem("currentPage");
    return savedPage ? Number(savedPage) : 1;
  });
  const [totalPages, setTotalPages] = useState(1);
  const [pageInput, setPageInput] = useState(page); // Initialize to the current page

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
        setTotalPages(Math.ceil(data.count / 40)); // Assuming 40 items per page
      } catch (error) {
        console.error("Error fetching games:", error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchGames();
  }, [page, submittedQuery]);

  // Save the page number to local storage whenever it changes
  useEffect(() => {
    localStorage.setItem("currentPage", page);
    setPageInput(page); // Update the input field to reflect the current page
  }, [page]);

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

  // Handle page input navigation
  const handlePageChange = (targetPage) => {
    setPage(targetPage);
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
        <span>
          Page{" "}
          <input
            type="number"
            min="1"
            max={totalPages}
            value={pageInput}
            onChange={(e) => setPageInput(Number(e.target.value))}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                const targetPage = Number(pageInput);
                if (targetPage >= 1 && targetPage <= totalPages) {
                  handlePageChange(targetPage); // Navigate to the inputted page
                } else {
                  alert(
                    `Please enter a valid page number between 1 and ${totalPages}`
                  );
                  setPageInput(page); // Reset to the current page on invalid input
                }
              }
            }}
            placeholder="Page..."
            className="page-input" // Optional: Add a class for styling
          />{" "}
          of {totalPages}
        </span>
        <button onClick={handleNextPage} disabled={page === totalPages}>
          Next
        </button>
      </div>
    </div>
  );
}
export default Directory;
