import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useSearchApi, movieHelpers } from "../hooks/useSearchApi";
import "../styles/App.css";

// SearchBar component handles search input, debouncing, dropdown results, and navigation
export default function SearchBar({ onSearch }) {
  const [query, setQuery] = useState("");             // What user is typing
  const [debouncedQuery, setDebouncedQuery] = useState(""); // Query used for API calls (after delay)
  const [showDropdown, setShowDropdown] = useState(false);   // Controls dropdown visibility
  const debounceTimer = useRef(null);                // Timer reference for debouncing
  const containerRef = useRef(null);                 // Reference for detecting outside clicks
  const navigate = useNavigate();                    // For navigating to search results page

  // Fetch search results using debounced query
  const { movies: results, loading } = useSearchApi({
    query: debouncedQuery,
    limit: 8 // Limit results shown in dropdown
  });

  // Handle typing in search input
  const handleChange = (e) => {
    const value = e.target.value;
    setQuery(value);

    // Reset debounce timer
    clearTimeout(debounceTimer.current);

    // Wait 300ms before updating debouncedQuery
    debounceTimer.current = setTimeout(() => {
      setDebouncedQuery(value);
      if (value.length > 0) setShowDropdown(true);
    }, 300);
  };

  // Handle form submission (user presses Enter)
  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSearch && query) onSearch(query); // Notify parent component
    setShowDropdown(false);
  };

  // Handle selecting an item from dropdown
  const handleSelect = (item) => {
    const title = movieHelpers.getTitle(item);
    setQuery(title);
    setShowDropdown(false);

    // Navigate to search results page using selected title
    navigate(`/SearchResult?search=${encodeURIComponent(title)}`);
  };

  // Simple text icons for media type
  const getMediaIcon = (mediaType) => {
    return mediaType === 'movie' ? 'Movie' : 'TV Show';
  };

  // Close dropdown when clicking outside the search box
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  // Only include movies & TV shows (multi-search also returns people)
  const filteredResults = results.filter(
    item => item.media_type === 'movie' || item.media_type === 'tv'
  );

  return (
    <div ref={containerRef} className="search">
      {/* Search input form */}
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

      {/* Dropdown menu */}
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
                  {/* Thumbnail image */}
                  <img
                    src={
                      movieHelpers.getPosterPath(item)
                        ? `https://image.tmdb.org/t/p/w92${movieHelpers.getPosterPath(item)}`
                        : "/placeholder.png" // Fallback if image missing
                    }
                    alt={movieHelpers.getTitle(item)}
                    className="search__dropdown-thumb"
                  />

                  {/* Info section */}
                  <div className="search__dropdown-info">
                    <div className="search__dropdown-title-row">
                      <span className="search__dropdown-title">
                        {movieHelpers.getTitle(item)}
                      </span>
                    </div>

                    <div className="search__dropdown-meta-row">
                      <span className="search__dropdown-media-icon">
                        {getMediaIcon(item.media_type)}
                      </span>

                      {/* Release year if available */}
                      {movieHelpers.getReleaseDate(item) && (
                        <span className="search__dropdown-year">
                          {movieHelpers.getReleaseDate(item)}
                        </span>
                      )}
                    </div>
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