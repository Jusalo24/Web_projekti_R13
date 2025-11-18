import { useEffect, useState } from "react";
import GetImage from "./GetImage";

export default function GetMoviesSeries({
  type = "now_playing",
  page = 1,
  pages = 1,
  imageSize = "w500",
  limit = null,
  query = "",
  ...discoverParams
}) {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { media_type } = discoverParams;

  const baseURL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3001";

  console.log("GetMoviesSeries props:", {
    type,
    page,
    pages,
    imageSize,
    limit,
    query,
    discoverParams,
    media_type
  });

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        setLoading(true);
        const allResults = [];

        for (let p = page; p <= pages; p++) {
          let url = "";

          if (query) {
            url = `${baseURL}/api/movies/search?q=${encodeURIComponent(query)}&page=${p}`;
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
  }, [type, page, pages, limit, query, JSON.stringify(discoverParams)]);

  // Helper function to get title (works for both movies and TV shows)
  const getTitle = (item) => {
    return item.title || item.name || "Untitled";
  };

  // Helper function to get release date (works for both movies and TV shows)
  const getReleaseDate = (item) => {
    const date = item.release_date || item.first_air_date;
    return date ? date.slice(0, 4) : "";
  };

  // Helper function to get rating
  const getRating = (item) => {
    return item.vote_average ? item.vote_average.toFixed(1) : "N/A";
  };

  // Helper function to get media type label
  const getMediaTypeLabel = (item) => {
    if (item.media_type === "tv") return "TV Show";
    if (item.media_type === "movie") return "Movie";
    return media_type === "tv" ? "TV Show" : "Movie";
  };

  if (loading) return <div className="movies-loading">Loading...</div>;
  if (error) return <div className="movies-error">Error: {error}</div>;
  if (movies.length === 0) return <div className="movies-empty">No results found.</div>;

  return (
    <div className="movies-grid">
      {movies.map((movie) => {
        // Create unique key combining media type and id
        const itemMediaType = movie.media_type || media_type || 'movie';
        const uniqueKey = `${itemMediaType}-${movie.id}`;

        return (
          <div key={uniqueKey} className="movie-card">
            <div className="movie-card__poster">
              <GetImage
                path={movie.poster_path}
                title={getTitle(movie)}
                size={imageSize}
              />
            </div>
            <div className="movie-card__info">
              <h3 className="movie-card__title">{getTitle(movie)}</h3>
              <div className="movie-card__footer">
                <span className="movie-card__type">
                  {getMediaTypeLabel(movie)}
                </span>
                {getReleaseDate(movie) && (
                  <span className="movie-card__year">
                    {getReleaseDate(movie)}
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}