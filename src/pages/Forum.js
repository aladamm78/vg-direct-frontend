import React, { useEffect, useState } from "react";
import "../styles/Forum.css";
import { useNavigate, Link } from "react-router-dom";

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
        const [postsResponse, genresResponse] = await Promise.all([
          fetch("http://localhost:5000/api/forum-posts"),
          fetch("http://localhost:5000/api/genres"),
        ]);

        if (!postsResponse.ok || !genresResponse.ok) {
          throw new Error("Failed to fetch data");
        }

        const postsData = await postsResponse.json();
        const genresData = await genresResponse.json();

        console.log("Fetched Posts:", postsData); // Confirm data fetched from the backend
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
        `http://localhost:5000/api/forum-posts/search?query=${searchQuery}`
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
        const response = await fetch("http://localhost:5000/api/forum-posts");
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
        `http://localhost:5000/api/forum-posts/filter-by-genre?genre=${genre}`
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
              {/* Updated to use Link */}
              <h2 className="post-title">
                <Link
                  to={`/forum/${encodeURIComponent(post.title)}`}
                  className="post-title-link"
                >
                  {post.title}
                </Link>
              </h2>
              <p className="post-body">{post.body.substring(0, 100)}...</p>
              <p className="post-tags">
                Tags:{" "}
                {post.tags && post.tags.length > 0
                  ? post.tags.join(", ")
                  : "None"}
              </p>
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
