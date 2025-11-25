import React from "react";
import { useNavigate } from "react-router-dom";
import { Trash2, PlusCircle } from "lucide-react";
import GetImage from "./GetImage";
import { useSearchApi, movieHelpers } from "../hooks/useSearchApi";
import { useGroupApi } from "../hooks/useGroupApi";
import AppNotification from "../components/AppNotification";

export default function GetMoviesSeries({
  type = "now_playing",  // Type of movies/series to fetch
  page = 1,              // Current page number
  pages = 1,             // Total pages to fetch (if paginated)
  imageSize = "w500",    // Size of poster images: w780, w500, w342, w185, w154, w92, original
  limit = null,          // Optional limit on number of results
  query = "",            // Search query
  movieIds = [],         // Specific movie IDs to fetch
  groupId = null,        // Group ID for group-related actions
  onDataChanged, // Callback when data changes (e.g. movie removed)
  ...discoverParams     // Additional parameters for discovery API
}) {
  const navigate = useNavigate(); // For navigation to detail page

  const { removeMovieFromGroup, addMovieToGroup, fetchMyGroups, myGroups, setNotification, notification, showSuccess, showError } = useGroupApi();

  // Custom hook to fetch movies/series based on params
  const { movies, loading, error } = useSearchApi({
    type,
    page,
    pages,
    limit,
    query,
    movieIds,
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

  // Handle clicking on a movie/TV show delete button
  const handleDeleteFromGroupClick = async (movie) => {
    // Determine the actual media type of this item
    const itemMediaType = movie.media_type || media_type || 'movie';
    const result = await removeMovieFromGroup(groupId, movie.id, itemMediaType);

    // If backend returns an error
    if (!result || result.error) {
      showError(result?.error || `Failed to remove movie`);
      return;
    }
    if (onDataChanged) onDataChanged(); // reload site
  }

  // Handle clicking on a movie/TV show plus button. Adds to latest group
  const handleAddToGroupClick = async (movie) => {
    await fetchMyGroups();
    if (!myGroups || myGroups.length === 0) {
      setNotification({
        message: "You are not a member of any groups!",
        type: "error"
      });
      return;
    }
    const itemMediaType = movie.media_type || media_type || 'movie';
    const result = await addMovieToGroup(myGroups[0].id, movie.id, itemMediaType);

    // If backend returns an error
    if (!result || result.error) {
      showError(result?.error || "Failed to add movie to group");
      return;
    }
    setNotification({
      message: "Movie added to latest group",
      type: "success"
    });
  }

  // Display loading, error, or empty states
  if (loading) return <div className="movies-loading">Loading...</div>;
  if (error) return <div className="movies-error">Error: {error}</div>;
  if (movies.length === 0) return <div className="movies-empty">No results found.</div>;

  // Render movies/series in a grid
  return (
    <div className="movies-grid">
      <AppNotification
        message={notification.message}   // Notification text
        type={notification.type}         // Notification type (success/error)
        onClose={() => setNotification({ message: null })} // Close popup
      />
      {movies.map((movie, index) => {
        // Use both media type, ID, and index to ensure uniqueness even for duplicates
        const uniqueKey = `${movieHelpers.getUniqueKey(movie, media_type)}-${index}`;

        return (
          <div
            key={uniqueKey}
            className="movie-card"
            onClick={() => handleCardClick(movie)}
          >
            {/* Poster image */}
            <div className="movie-card__poster">
              {type === "group_movies" && (
                <button
                  className="movie-card__delete-from-group"
                  key={uniqueKey}
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent card click
                    handleDeleteFromGroupClick(movie);
                  }}
                >
                  <Trash2 size={24} />
                </button>
              )}
              {type != "group_movies" && (
                <button
                  className="movie-card__add-to-group"
                  key={uniqueKey}
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent card click
                    handleAddToGroupClick(movie);
                  }}
                >
                  <PlusCircle size={24} />
                </button>
              )}
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
