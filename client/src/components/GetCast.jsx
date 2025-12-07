import React from "react";
import { useState, useEffect, useRef } from "react";

export default function GetCast({ 
    onSelect, 
    disabled = false 
}) {
    // State for input query, search results, dropdown visibility, and loading state
    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [loading, setLoading] = useState(false);

    console.log("[GetCast] render - query:", query, "disabled:", disabled);

    // Ref to track component container for detecting clicks outside
    const containerRef = useRef(null);

    // Ref to store debounce timer
    const debounceTimer = useRef(null);

    const baseURL = import.meta.env.VITE_API_BASE_URL; // API base URL

    // FIXED: Add cleanup effect for debounce timer
    useEffect(() => {
        return () => {
            if (debounceTimer.current) {
                clearTimeout(debounceTimer.current);
            }
        };
    }, []);

    // Function to fetch cast members from API based on query
    const fetchCast = async (name) => {
        if (!name) {
            setResults([]); // Clear results if query is empty
            return;
        }
        try {
            setLoading(true); // Start loading
            const res = await fetch(
                `${baseURL}/api/search/person?q=${encodeURIComponent(name)}&page=1`
            );
            if (!res.ok) throw new Error("Failed to fetch cast");
            const data = await res.json();
            setResults(data?.results || []); // Save results
        } catch (err) {
            console.error("Error fetching cast:", err);
            setResults([]); // Clear results on error
        } finally {
            setLoading(false); // Stop loading
        }
    };

    // Handle input changes with debounce
    const handleChange = (e) => {
        if (disabled) return; // Do nothing if input is disabled
        const value = e.target.value;
        setQuery(value);

        clearTimeout(debounceTimer.current); // Clear previous debounce
        debounceTimer.current = setTimeout(() => {
            fetchCast(value); // Fetch cast after 300ms
            if (value.length > 0) setShowDropdown(true); // Show dropdown if input not empty
        }, 300);
    };

    // Handle selecting a cast member
    const handleSelect = (person) => {
        if (disabled) return;
        console.log("[GetCast] handleSelect - person.id:", person.id, "person.name:", person.name);
        setQuery(person.name); // Set input to selected name
        setShowDropdown(false); // Hide dropdown
        setResults([]); // Clear results
        if (onSelect) onSelect(person.id); // Pass selected ID to parent
    };

    // Handle clearing the input and selection
    const handleClear = () => {
        console.log("[GetCast] handleClear - clearing cast selection");
        setQuery("");
        setResults([]);
        setShowDropdown(false);
        if (onSelect) onSelect(""); // Notify parent that selection is cleared
    };

    // Close dropdown when clicking outside the component
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
            {/* Input field with clear button */}
            <div className="cast-search__input-wrapper">
                <input
                    type="text"
                    placeholder={disabled ? "Disabled for TV" : "Search cast member..."}
                    value={query}
                    onChange={handleChange}
                    onFocus={() => {
                        if (results.length > 0) setShowDropdown(true); // Show dropdown on focus
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

            {/* Dropdown with search results */}
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
