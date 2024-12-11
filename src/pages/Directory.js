import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../styles/Directory.css";

function Directory({ searchQuery }) { // Accept searchQuery as a prop
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [page, setPage] = useState(() => {
    const savedPage = localStorage.getItem("currentPage");
    return savedPage ? Number(savedPage) : 1;
  });
  const [totalPages, setTotalPages] = useState(1);
  const [pageInput, setPageInput] = useState(page);

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

  useEffect(() => {
    if (searchQuery) {
      setSubmittedQuery(searchQuery);
      setPage(1);
    }
  }, [searchQuery]); // Trigger refetch when searchQuery changes

  useEffect(() => {
    localStorage.setItem("currentPage", page);
    setPageInput(page);
  }, [page]);

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

  const handlePageChange = (targetPage) => {
    setPage(targetPage);
  };

  if (loading) return <p>Loading games...</p>;

  return (
    <div>
      <h1>Game Directory</h1>

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
                  handlePageChange(targetPage);
                } else {
                  alert(
                    `Please enter a valid page number between 1 and ${totalPages}`
                  );
                  setPageInput(page);
                }
              }
            }}
            placeholder="Page..."
            className="page-input"
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