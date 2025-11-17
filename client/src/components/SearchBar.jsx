import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/index.css";

export default function SearchBar({ onSearch }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const debounceTimer = useRef(null);
  const containerRef = useRef(null);
  const navigate = useNavigate();

  const fetchResults = async (search) => {
    if (!search) {
      setResults([]);
      return;
    }
    try {
      const res = await fetch(
        `http://localhost:3001/api/movies/search?q=${encodeURIComponent(search)}&page=1`
      );
      const data = await res.json();
      setResults(data?.results || []);
    } catch (err) {
      console.error("Search error", err);
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
    if (onSearch) onSearch(query);
    setShowDropdown(false);
  };

  const handleSelect = (movie) => {
    setQuery(movie.title);
    setShowDropdown(false);
    setResults([]);

    navigate(`/SearchResult?search=${encodeURIComponent(movie.title)}`);
  };

  // sulje dropdown klikatessa ulkopuolelta
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
    <div ref={containerRef} className="search-wrapper">
      <form className="search-bar" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Search movies..."
          value={query}
          onChange={handleChange}
        />
        <button type="submit">Search</button>
      </form>

      {showDropdown && (
        <ul className="search-dropdown">
          {results.length === 0 ? (
            <li className="dropdown-empty">No results</li>
          ) : (
            results.map((movie) => (
              <li
                key={movie.id}
                className="dropdown-item"
                onClick={() => handleSelect(movie)}
              >
                <img
                  src={
                    movie.poster_path
                      ? `https://image.tmdb.org/t/p/w92${movie.poster_path}`
                      : "/placeholder.png"
                  }
                  alt={movie.title}
                  className="dropdown-thumb"
                />
                <span>{movie.title}</span>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
