import { useNavigate } from "react-router-dom";
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
  const navigate = useNavigate(); // For navigation to detail page

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

  // Handle clicking on a movie/TV show card
  const handleCardClick = (movie) => {
    // Determine the actual media type of this item
    const itemMediaType = movie.media_type || media_type || 'movie';
    // Pass media type as query parameter to differentiate between movie and TV with same ID
    navigate(`/movies/${movie.id}?type=${itemMediaType}`);
  };

  // Display loading, error, or empty states
  if (loading) return <div className="movies-loading">Loading...</div>;
  if (error) return <div className="movies-error">Error: {error}</div>;
  if (movies.length === 0) return <div className="movies-empty">No results found.</div>;

  // Render movies/series in a grid
  return (
    <div className="movies-grid">
      {movies.map((movie, index) => {
        // Use both media type, ID, and index to ensure uniqueness even for duplicates
        const uniqueKey = `${movieHelpers.getUniqueKey(movie, media_type)}-${index}`;

        return (
          <div 
            key={uniqueKey} 
            className="movie-card"
            onClick={() => handleCardClick(movie)}
            style={{ cursor: 'pointer' }}
          >
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
