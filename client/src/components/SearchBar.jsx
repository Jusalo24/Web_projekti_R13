import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useSearchApi, movieHelpers } from "../hooks/useSearchApi";
import "../styles/index.css";

export default function SearchBar({ onSearch }) {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const debounceTimer = useRef(null);
  const containerRef = useRef(null);
  const navigate = useNavigate();

  // Use the shared hook with debounced query
  const { movies: results, loading } = useSearchApi({
    query: debouncedQuery,
    limit: 8
  });

  const handleChange = (e) => {
    const value = e.target.value;
    setQuery(value);

    clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      setDebouncedQuery(value);
      if (value.length > 0) setShowDropdown(true);
    }, 300);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSearch && query) onSearch(query);
    setShowDropdown(false);
  };

  const handleSelect = (item) => {
    const title = movieHelpers.getTitle(item);
    setQuery(title);
    setShowDropdown(false);
    navigate(`/SearchResult?search=${encodeURIComponent(title)}`);
  };

  const getMediaIcon = (mediaType) => {
    return mediaType === 'movie' ? 'Movie' : 'TV Show';
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

  // Filter only movies and TV shows from multi-search results
  const filteredResults = results.filter(
    item => item.media_type === 'movie' || item.media_type === 'tv'
  );

  return (
    <div ref={containerRef} className="search">
      <form className="search__form" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Search..."
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
          ) : filteredResults.length === 0 ? (
            <div className="search__dropdown-empty">No results</div>
          ) : (
            <div className="search__dropdown-results">
              {filteredResults.map((item) => (
                <div
                  key={movieHelpers.getUniqueKey(item)}
                  className="search__dropdown-movie"
                  onClick={() => handleSelect(item)}
                >
                  <img
                    src={
                      movieHelpers.getPosterPath(item)
                        ? `https://image.tmdb.org/t/p/w92${movieHelpers.getPosterPath(item)}`
                        : "/placeholder.png"
                    }
                    alt={movieHelpers.getTitle(item)}
                    className="search__dropdown-thumb"
                  />
                  <div className="search__dropdown-info">
                    <div className="search__dropdown-title-row">
                      <span className="search__dropdown-media-icon">
                        {getMediaIcon(item.media_type)}
                      </span>
                      <span className="search__dropdown-title">
                        {movieHelpers.getTitle(item)}
                      </span>
                    </div>
                    {movieHelpers.getReleaseDate(item) && (
                      <span className="search__dropdown-year">
                        {movieHelpers.getReleaseDate(item)}
                      </span>
                    )}
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