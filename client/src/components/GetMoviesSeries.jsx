import GetImage from "./GetImage";
import { useSearchApi, movieHelpers } from "../hooks/useSearchApi";

export default function GetMoviesSeries({
  type = "now_playing",  // Type of movies/series to fetch
  page = 1,              // Current page number
  pages = 1,             // Total pages to fetch (if paginated)
  imageSize = "w500",    // Size of poster images
  limit = null,          // Optional limit on number of results
  query = "",            // Search query
  ...discoverParams      // Additional parameters for discovery API
}) {
  // Custom hook to fetch movies/series based on params
  const { movies, loading, error } = useSearchApi({
    type,
    page,
    pages,
    limit,
    query,
    discoverParams
  });

  const { media_type } = discoverParams; // Media type (movie or tv)

  // Display loading, error, or empty states
  if (loading) return <div className="movies-loading">Loading...</div>;
  if (error) return <div className="movies-error">Error: {error}</div>;
  if (movies.length === 0) return <div className="movies-empty">No results found.</div>;

  // Render movies/series in a grid
  return (
    <div className="movies-grid">
      {movies.map((movie) => {
        const uniqueKey = movieHelpers.getUniqueKey(movie, media_type); // Unique key for React

        return (
          <div key={uniqueKey} className="movie-card">
            {/* Poster image */}
            <div className="movie-card__poster">
              <GetImage
                path={movie.poster_path}
                title={movieHelpers.getTitle(movie)} // Movie/series title for alt text
                size={imageSize}
              />
            </div>

            {/* Movie/series info */}
            <div className="movie-card__info">
              <h3 className="movie-card__title">{movieHelpers.getTitle(movie)}</h3>
              <div className="movie-card__footer">
                {/* Show type (Movie or TV Show) */}
                <span className="movie-card__type">
                  {movieHelpers.getMediaTypeLabel(movie, media_type)}
                </span>

                {/* Show release year if available */}
                {movieHelpers.getReleaseDate(movie) && (
                  <span className="movie-card__year">
                    {movieHelpers.getReleaseDate(movie)}
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
