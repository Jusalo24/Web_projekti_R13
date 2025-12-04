import react, { useEffect, useState } from "react";

export function useSearchApi({
    type = "now_playing",   // Type of content to fetch (e.g. now_playing, discover, etc.)
    page = 1,               // Starting page number
    pages = 1,              // How many pages to load
    limit = null,           // Optional limit for total results
    query = "",             // Search query
    movieIds = [],        // Specific movie IDs for group_movies type
    discoverParams = {},     // Extra parameters for discovery-based searches
    append = false        // Whether to append results on pagination
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

                console.log("Fetching movies with params:", {
                    movieIds,
                });


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

                    // If it's a group movies request
                    else if (type === "group_movies" && movieIds.length > 0) {

                        // Loop through each movie/TV item individually
                        for (const item of movieIds) {

                            // Determine whether to call the movie or TV endpoint
                            const endpoint =
                                item.type === "movie"
                                    ? `${baseURL}/api/movies/byId/${item.id}`
                                    : `${baseURL}/api/tv/${item.id}`;

                            try {
                                // Fetch a single item by ID
                                const response = await fetch(endpoint);

                                // If the request fails, log it and continue with the next item
                                if (!response.ok) {
                                    console.error("Fetch error:", response.status, endpoint);
                                    continue;
                                }

                                // Parse the response JSON
                                const data = await response.json();

                                // Add media_type
                                if (item.type === "movie") {
                                    allResults.push({ ...data, media_type: "movie" });
                                } else {
                                    allResults.push({ ...data, media_type: "tv" });
                                }

                            } catch (err) {
                                // Catch any network/parse errors and continue
                                console.error("Exception fetching:", endpoint, err);
                            }
                        }

                        // Skip the default page-based fetching logic
                        continue;
                    }
                    // Default movie/TV endpoints (e.g. now_playing, popular)
                    else {
                        if (media_type === "tv" || type.startsWith("tv_")) {
                            const tvType = type.replace("tv_", "");
                            const queryString = new URLSearchParams({ page: p, ...discoverParams }).toString();
                            url = `${baseURL}/api/tv/${tvType}?${queryString}`;
                        } else {
                            const queryString = new URLSearchParams({ page: p, ...discoverParams }).toString();
                            url = `${baseURL}/api/movies/${type}?${queryString}`;
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
                setMovies(prev =>
                    append ? [...prev, ...allResults] : (limit ? allResults.slice(0, limit) : allResults)
                );
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
