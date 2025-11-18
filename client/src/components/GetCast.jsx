import { useState, useEffect, useRef } from "react";

export default function GetCast({ onSelect, disabled = false }) {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [loading, setLoading] = useState(false);
    const containerRef = useRef(null);
    const debounceTimer = useRef(null);

    const baseURL = import.meta.env.VITE_API_BASE_URL;

    const fetchCast = async (name) => {
        if (!name) {
            setResults([]);
            return;
        }
        try {
            setLoading(true);
            const res = await fetch(
                `${baseURL}/api/search/person?q=${encodeURIComponent(name)}&page=1`
            );
            if (!res.ok) throw new Error("Failed to fetch cast");
            const data = await res.json();
            setResults(data?.results || []);
        } catch (err) {
            console.error("Error fetching cast:", err);
            setResults([]);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        if (disabled) return;
        const value = e.target.value;
        setQuery(value);

        clearTimeout(debounceTimer.current);
        debounceTimer.current = setTimeout(() => {
            fetchCast(value);
            if (value.length > 0) setShowDropdown(true);
        }, 300);
    };

    const handleSelect = (person) => {
        if (disabled) return;
        setQuery(person.name);
        setShowDropdown(false);
        setResults([]);
        if (onSelect) onSelect(person.id);
    };

    const handleClear = () => {
        setQuery("");
        setResults([]);
        setShowDropdown(false);
        if (onSelect) onSelect("");
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
        <div ref={containerRef} className="cast-search">
            <div className="cast-search__input-wrapper">
                <input
                    type="text"
                    placeholder={disabled ? "Disabled for TV" : "Search cast member..."}
                    value={query}
                    onChange={handleChange}
                    onFocus={() => {
                        if (results.length > 0) setShowDropdown(true);
                    }}
                    className="cast-search__input"
                    disabled={disabled}
                    
                />
                {query && (
                    <button
                        type="button"
                        onClick={handleClear}
                        className="cast-search__clear"
                        aria-label="Clear cast selection"
                    >
                        ✕
                    </button>
                )}
            </div>

            {showDropdown && (
                <ul className="cast-search__dropdown">
                    {loading ? (
                        <li className="cast-search__dropdown-loading">Searching...</li>
                    ) : results.length === 0 ? (
                        <li className="cast-search__dropdown-empty">No cast members found</li>
                    ) : (
                        results.map((person) => (
                            <li
                                key={person.id}
                                onClick={() => handleSelect(person)}
                                className="cast-search__dropdown-item"
                            >
                                <div className="cast-search__dropdown-info">
                                    <span className="cast-search__dropdown-name">{person.name}</span>
                                    {person.known_for_department && (
                                        <span className="cast-search__dropdown-dept">
                                            {person.known_for_department}
                                        </span>
                                    )}
                                </div>
                            </li>
                        ))
                    )}
                </ul>
            )}
        </div>
    );
}