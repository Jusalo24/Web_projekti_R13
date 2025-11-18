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

  const baseURL = import.meta.env.VITE_API_BASE_URL;

  const fetchResults = async (search) => {
    if (!search) {
      setResults([]);
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(
        `${baseURL}/api/search/multi?q=${encodeURIComponent(search)}&page=1`
      );
      const data = await res.json();
      // Filter to show only movies and TV shows, limit to 8 results
      const filtered = (data?.results || [])
        .filter(item => item.media_type === 'movie' || item.media_type === 'tv')
        .slice(0, 8);
      setResults(filtered);
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

  const handleSelect = (item) => {
    const title = item.media_type === 'movie' ? item.title : item.name;
    setQuery(title);
    setShowDropdown(false);
    navigate(`/SearchResult?search=${encodeURIComponent(title)}`);
  };

  const getMediaIcon = (mediaType) => {
    return mediaType === 'movie' ? 'Movie' : 'TV Show';
  };

  const getTitle = (item) => {
    return item.media_type === 'movie' ? item.title : item.name;
  };

  const getReleaseYear = (item) => {
    const date = item.media_type === 'movie' ? item.release_date : item.first_air_date;
    return date ? date.substring(0, 4) : '';
  };

  const getPosterPath = (item) => {
    return item.poster_path || item.profile_path;
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
          ) : results.length === 0 ? (
            <div className="search__dropdown-empty">No results</div>
          ) : (
            <div className="search__dropdown-results">
              {results.map((item) => (
                <div
                  key={`${item.media_type}-${item.id}`}
                  className="search__dropdown-movie"
                  onClick={() => handleSelect(item)}
                >
                  <img
                    src={
                      getPosterPath(item)
                        ? `https://image.tmdb.org/t/p/w92${getPosterPath(item)}`
                        : "/placeholder.png"
                    }
                    alt={getTitle(item)}
                    className="search__dropdown-thumb"
                  />
                  <div className="search__dropdown-info">
                    <div className="search__dropdown-title-row">
                      <span className="search__dropdown-media-icon">
                        {getMediaIcon(item.media_type)}
                      </span>
                      <span className="search__dropdown-title">{getTitle(item)}</span>
                    </div>
                    {getReleaseYear(item) && (
                      <span className="search__dropdown-year">
                        {getReleaseYear(item)}
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