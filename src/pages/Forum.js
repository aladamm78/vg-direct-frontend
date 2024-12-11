import React, { useEffect, useState } from "react";
import "../styles/Forum.css";
import { useNavigate, Link } from "react-router-dom";
import { BASE_URL } from "../services/api";

function Forum() {
  const [posts, setPosts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [genres, setGenres] = useState([]); 
  const [selectedGenre, setSelectedGenre] = useState(""); 
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch forum posts and genres on component mount
    const fetchData = async () => {
      try {
        const postsURL = `${BASE_URL}/api/forum-posts`;
        const genresURL = `${BASE_URL}/api/genres`;
        console.log("Fetching forum posts from:", postsURL);
        console.log("Fetching genres from:", genresURL);
  
        const [postsResponse, genresResponse] = await Promise.all([
          fetch(postsURL),
          fetch(genresURL),
        ]);
  
        if (!postsResponse.ok || !genresResponse.ok) {
          throw new Error("Failed to fetch data");
        }
  
        const postsData = await postsResponse.json();
        const genresData = await genresResponse.json();
  
        console.log("Fetched Posts Data:", postsData); // Confirm data fetched from the backend
        console.log("Fetched Genres Data:", genresData); // Confirm genres fetched
        setPosts(postsData || []); // Set fetched posts
        setGenres(genresData || []); // Set fetched genres
      } catch (error) {
        console.error("Error fetching data:", error.message);
      } finally {
        setLoading(false);
      }
    };
  
    fetchData();
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(
        `${BASE_URL}/api/forum-posts/search?query=${searchQuery}`
      );

      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      setPosts(data || []);
    } catch (error) {
      console.error("Error searching posts:", error.message);
    }
  };

  const handleFilterByGenre = async (e) => {
    const genre = e.target.value;
    setSelectedGenre(genre);

    if (!genre) {
      // If no genre is selected, fetch all posts
      try {
        const response = await fetch(`${BASE_URL}/api/forum-posts/search?query=${searchQuery}`);
        const data = await response.json();
        setPosts(data || []);
      } catch (error) {
        console.error("Error fetching all posts:", error.message);
      }
      return;
    }

    // Fetch posts filtered by genre
    try {
      const response = await fetch(
        `${BASE_URL}/api/forum-posts/filter-by-genre?genre=${genre}`
      );

      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      setPosts(data || []);
    } catch (error) {
      console.error("Error filtering posts:", error.message);
    }
  };

  // Sort posts by `created_at` (newest first)
  const sortedPosts = [...posts].sort(
    (a, b) => new Date(b.created_at) - new Date(a.created_at)
  );

  if (loading) return <p>Loading forum posts...</p>;

  return (
    <div className="forum-container">
      <h1 className="forum-title">Community Forum</h1>
      
      <button
        className="create-forum-button"
        onClick={() => navigate("/create-forum")}
      >
        Create Forum
      </button>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="search-bar">
        <input
          type="text"
          placeholder="Search posts..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
        />
        <button type="submit" className="search-button">
          Search
        </button>
      </form>

      {/* Genre Filter */}
      <div className="genre-filter">
        <label htmlFor="genre-select">Filter by Genre:</label>
        <select
          id="genre-select"
          value={selectedGenre}
          onChange={handleFilterByGenre}
          className="genre-select"
        >
          <option value="">All Genres</option>
          {genres.map((genre) => (
            <option key={genre.genre_id} value={genre.name}>
              {genre.name}
            </option>
          ))}
        </select>
      </div>

      {/* Forum Posts */}
      <ul className="posts-list">
        {sortedPosts && sortedPosts.length > 0 ? (
          sortedPosts.map((post) => (
            <li key={post.post_id} className="post-card">
              <h2 className="post-title">
                <Link
                  to={`/forum/${encodeURIComponent(post.title)}`}
                  className="post-title-link"
                >
                  {post.title}
                </Link>
              </h2>
              <p className="post-body">{post.body.substring(0, 100)}...</p>
              
              {/* Only display tags if no genre filter is applied */}
              {!selectedGenre && (
                <p className="post-tags">
                  Tags:{" "}
                  {post.tags && post.tags.length > 0
                    ? post.tags.join(", ")
                    : "None"}
                </p>
              )}
              <div className="post-meta">
                <span className="comment-count">Comments: {post.comment_count}</span>
                <span className="post-date">
                  Posted on: {new Date(post.created_at).toLocaleDateString()}
                </span>
              </div>
            </li>
          ))
        ) : (
          <p>No posts available</p>
        )}
      </ul>
    </div>
  );
}

export default Forum;
