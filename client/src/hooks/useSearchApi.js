import react, { useEffect, useState } from "react";

export function useSearchApi({
    type = "now_playing",   // Type of content to fetch (e.g. now_playing, discover, etc.)
    page = 1,               // Starting page number
    pages = 1,              // How many pages to load
    limit = null,           // Optional limit for total results
    query = "",             // Search query
    discoverParams = {}     // Extra parameters for discovery-based searches
}) {
    const [movies, setMovies] = useState([]);    // Stores fetched movie/TV results
    const [loading, setLoading] = useState(true); // Tracks loading state
    const [error, setError] = useState(null);     // Stores any fetch error messages

    const baseURL = import.meta.env.VITE_API_BASE_URL;  // Base URL from env variables
    const { media_type } = discoverParams;               // Content type hint (movie/tv)

    useEffect(() => {
        const fetchMovies = async () => {
            try {
                setLoading(true);
                const allResults = []; // To collect results across pages

                // Loop through all requested pages
                for (let p = page; p <= pages; p++) {
                    let url = "";

                    // If user typed a search query
                    if (query) {
                        url = `${baseURL}/api/search/multi?q=${encodeURIComponent(query)}&page=${p}`;
                    }
                    // If it's a discover-type request
                    else if (type === "discover") {
                        const queryString = new URLSearchParams({ page: p, ...discoverParams }).toString();

                        // Choose TV or Movie discovery endpoint
                        if (media_type === "tv") {
                            url = `${baseURL}/api/tv/discover?${queryString}`;
                        } else {
                            url = `${baseURL}/api/movies/discover?${queryString}`;
                        }
                    }
                    // Default movie/TV endpoints (e.g. now_playing, popular)
                    else {
                        if (media_type === "tv" || type.startsWith("tv_")) {
                            // Remove the "tv_" prefix to match backend endpoint
                            const tvType = type.replace("tv_", "");
                            url = `${baseURL}/api/tv/${tvType}?page=${p}`;
                        } else {
                            url = `${baseURL}/api/movies/${type}?page=${p}`;
                        }
                    }

                    // Fetch from the determined URL
                    const response = await fetch(url);
                    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

                    const data = await response.json();
                    const results = data.results || []; // Fallback to empty array

                    allResults.push(...results); // Add to master list
                }

                // Apply optional result limit
                setMovies(limit ? allResults.slice(0, limit) : allResults);
            } catch (err) {
                console.error("Error fetching movies:", err);
                setError(err.message);
            } finally {
                setLoading(false); // Always turn off loading when done
            }
        };

        // Start fetching whenever dependencies change
        fetchMovies();
    }, [type, page, pages, limit, query, JSON.stringify(discoverParams), baseURL]);

    return { movies, loading, error }; // Return useful data for components
}

// Utility helper functions for working with movie/TV items
export const movieHelpers = {
    // Get movie or TV title
    getTitle: (item) => {
        return item.title || item.name || "Untitled";
    },

    // Extract release year
    getReleaseDate: (item) => {
        const date = item.release_date || item.first_air_date;
        return date ? date.slice(0, 4) : "";
    },

    // Format rating to 1 decimal
    getRating: (item) => {
        return item.vote_average ? item.vote_average.toFixed(1) : "N/A";
    },

    // Get proper label depending on media type
    getMediaTypeLabel: (item, fallbackMediaType = "movie") => {
        if (item.media_type === "tv") return "TV Show";
        if (item.media_type === "movie") return "Movie";
        return fallbackMediaType === "tv" ? "TV Show" : "Movie";
    },

    // Return either poster or profile image
    getPosterPath: (item) => {
        return item.poster_path || item.profile_path;
    },

    // Generate unique React key combining media type + ID
    getUniqueKey: (item, fallbackMediaType = "movie") => {
        const itemMediaType = item.media_type || fallbackMediaType;
        return `${itemMediaType}-${item.id}`;
    }
};
