import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/index.css";

export default function SearchBar({ onSearch }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const debounceTimer = useRef(null);
  const containerRef = useRef(null);
  const navigate = useNavigate();

  const fetchResults = async (search) => {
    if (!search) {
      setResults([]);
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(
        `http://localhost:3001/api/movies/search?q=${encodeURIComponent(search)}&page=1`
      );
      const data = await res.json();
      setResults((data?.results || []).slice(0, 5)); // Limit to 5 results
    } catch (err) {
      console.error("Search error", err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const value = e.target.value;
    setQuery(value);

    clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      fetchResults(value);
      if (value.length > 0) setShowDropdown(true);
    }, 300);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSearch && query) onSearch(query);
    setShowDropdown(false);
  };

  const handleSelect = (movie) => {
    setQuery(movie.title);
    setShowDropdown(false);
    navigate(`/SearchResult?search=${encodeURIComponent(movie.title)}`);
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="search">
      <form className="search__form" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Search movies..."
          value={query}
          onChange={handleChange}
          className="search__input"
        />
        <button type="submit" className="search__button">
          Search
        </button>
      </form>

      {showDropdown && (
        <div className="search__dropdown-container">
          {loading ? (
            <div className="search__dropdown-empty">Searching...</div>
          ) : results.length === 0 ? (
            <div className="search__dropdown-empty">No results</div>
          ) : (
            <div className="search__dropdown-results">
              {results.map((movie) => (
                <div
                  key={movie.id}
                  className="search__dropdown-movie"
                  onClick={() => handleSelect(movie)}
                >
                  <img
                    src={
                      movie.poster_path
                        ? `https://image.tmdb.org/t/p/w92${movie.poster_path}`
                        : "/placeholder.png"
                    }
                    alt={movie.title}
                    className="search__dropdown-thumb"
                  />
                  <div className="search__dropdown-info">
                    <span className="search__dropdown-title">{movie.title}</span>
                    <span className="search__dropdown-year">
                      {movie.release_date?.substring(0, 4)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}