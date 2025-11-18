import { useEffect, useState } from "react";

export function useSearchApi({
    type = "now_playing",
    page = 1,
    pages = 1,
    limit = null,
    query = "",
    discoverParams = {}
}) {
    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const baseURL = import.meta.env.VITE_API_BASE_URL;
    const { media_type } = discoverParams;

    useEffect(() => {
        const fetchMovies = async () => {
            try {
                setLoading(true);
                const allResults = [];

                for (let p = page; p <= pages; p++) {
                    let url = "";

                    if (query) {
                        url = `${baseURL}/api/search/multi?q=${encodeURIComponent(query)}&page=${p}`;
                    } else if (type === "discover") {
                        const queryString = new URLSearchParams({ page: p, ...discoverParams }).toString();

                        // Check if we're searching for TV shows or movies
                        if (media_type === "tv") {
                            url = `${baseURL}/api/tv/discover?${queryString}`;
                        } else {
                            url = `${baseURL}/api/movies/discover?${queryString}`;
                        }
                    } else {
                        // Support both movie and TV endpoints
                        if (media_type === "tv" || type.startsWith("tv_")) {
                            // Remove 'tv_' prefix if present for the endpoint
                            const tvType = type.replace("tv_", "");
                            url = `${baseURL}/api/tv/${tvType}?page=${p}`;
                        } else {
                            url = `${baseURL}/api/movies/${type}?page=${p}`;
                        }
                    }

                    const response = await fetch(url);
                    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

                    const data = await response.json();
                    const results = data.results || [];

                    allResults.push(...results);
                }

                // Apply limit if specified
                setMovies(limit ? allResults.slice(0, limit) : allResults);
            } catch (err) {
                console.error("Error fetching movies:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchMovies();
    }, [type, page, pages, limit, query, JSON.stringify(discoverParams), baseURL]);

    return { movies, loading, error };
}

// Helper functions that can be exported and reused
export const movieHelpers = {
    getTitle: (item) => {
        return item.title || item.name || "Untitled";
    },

    getReleaseDate: (item) => {
        const date = item.release_date || item.first_air_date;
        return date ? date.slice(0, 4) : "";
    },

    getRating: (item) => {
        return item.vote_average ? item.vote_average.toFixed(1) : "N/A";
    },

    getMediaTypeLabel: (item, fallbackMediaType = "movie") => {
        if (item.media_type === "tv") return "TV Show";
        if (item.media_type === "movie") return "Movie";
        return fallbackMediaType === "tv" ? "TV Show" : "Movie";
    },

    getPosterPath: (item) => {
        return item.poster_path || item.profile_path;
    },

    getUniqueKey: (item, fallbackMediaType = "movie") => {
        const itemMediaType = item.media_type || fallbackMediaType;
        return `${itemMediaType}-${item.id}`;
    }
};