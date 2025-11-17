import { useState } from "react";
import "../styles/index.css";

export default function SearchBar({ onSearch }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  let debounceTimer;

  const fetchResults = async (search) => {
    if (!search) {
      setResults([]);
      return;
    }
    try {
      const res = await fetch(`/api/movies/search?q=${search}&page=1`);
      const data = await res.json();
      setResults(data?.results || []);
    } catch (err) {
      console.error("Search error", err);
    }
  };

  const handleChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    setShowDropdown(true);

    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => fetchResults(value), 400);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setShowDropdown(false);
    if (onSearch) onSearch(query);
  };

  const handleSelect = (title) => {
    setQuery(title);
    setShowDropdown(false);
    if (onSearch) onSearch(title);
  };

  return (
    <div className="search-wrapper">
    <div className="search-container">
      <form className="search-bar" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Search movies..."
          value={query}
          onChange={handleChange}
        />
        <button type="submit">Search</button>
      </form>

      {showDropdown && results.length > 0 && (
        <ul className="search-dropdown">
          {results.map((movie) => (
            <li key={movie.id} className="dropdown-item" onClick={() => handleSelect(movie.title)}>
              <img
                src={`https://image.tmdb.org/t/p/w92${movie.poster_path}`}
                alt={movie.title}
                className="dropdown-thumb"
              />
              <span>{movie.title}</span>
            </li>
          ))}
        </ul>
      )}
          </div>
    </div>
  );
}
