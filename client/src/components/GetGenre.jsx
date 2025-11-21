import React from "react";
import { useEffect, useState } from "react";

export default function GetGenre({
    onSelect,         // Callback function to send selected genre back to parent
    selectedGenre,    // Currently selected genre ID
    mediaType = "movie" // "movie" or "tv", determines which genres to fetch
}) {
    // State to store fetched genres from API
    const [genres, setGenres] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Base URL for API requests (from environment variable or fallback)
    const baseURL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3001";

    // Fetch genres from API whenever mediaType changes
    useEffect(() => {
        const fetchGenres = async () => {
            try {
                setLoading(true); // Show loading state

                // Choose endpoint based on media type
                const endpoint = mediaType === "tv" ? "tv" : "movie";
                const res = await fetch(`${baseURL}/api/genres/${endpoint}`);
                if (!res.ok) throw new Error("Failed to fetch genres");

                const data = await res.json();
                setGenres(data.genres || []); // Save fetched genres
            } catch (err) {
                console.error("Failed to fetch genres:", err);
                setError(err.message); // Save error message
            } finally {
                setLoading(false); // Stop loading
            }
        };

        fetchGenres();
    }, [mediaType]); // Re-run when mediaType changes

    // Handle dropdown selection change
    const handleChange = (e) => {
        const value = e.target.value;
        if (onSelect) onSelect(value); // Pass selected genre ID to parent
    };

    // Render loading state
    if (loading) {
        return (
            <select className="filter-group__select" disabled>
                <option>Loading genres...</option>
            </select>
        );
    }

    // Render error state
    if (error) {
        return (
            <select className="filter-group__select" disabled>
                <option>Error loading genres</option>
            </select>
        );
    }

    // Render genre dropdown when data is ready
    return (
        <select
            className="filter-group__select"
            value={selectedGenre || ""} // Selected value or empty string
            onChange={handleChange}
        >
            <option value="">All Genres</option> {/* Default option */}
            {genres.map((genre) => (
                <option key={genre.id} value={genre.id}>
                    {genre.name} {/* Display genre name */}
                </option>
            ))}
        </select>
    );
}
