import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Share2, Calendar, AlertCircle } from "lucide-react";
import { useShareApi } from "../hooks/useShareApi";
import GetImage from "../components/GetImage";
import "../styles/shared-list.css";

export default function SharedList() {
  const { shareToken } = useParams();
  const navigate = useNavigate();
  
  const [sharedData, setSharedData] = useState(null);
  const [movieDetails, setMovieDetails] = useState([]);
  const [loadingMovies, setLoadingMovies] = useState(false);

  const { loading, error, getSharedList } = useShareApi(null);
  const baseURL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    loadSharedList();
  }, [shareToken]);

  const loadSharedList = async () => {
    const data = await getSharedList(shareToken);
    
    if (data) {
      setSharedData(data);
      await loadMovieDetails(data.items);
    }
  };

  const loadMovieDetails = async (items) => {
    if (!items || items.length === 0) return;

    setLoadingMovies(true);
    const details = [];

    for (const item of items) {
      const [mediaType, movieId] = item.movie_external_id.split(":");

      try {
        const endpoint = mediaType === "tv"
          ? `${baseURL}/api/tv/${movieId}`
          : `${baseURL}/api/movies/byId/${movieId}`;

        const res = await fetch(endpoint);
        
        if (res.ok) {
          const movieData = await res.json();
          details.push({
            ...movieData,
            media_type: mediaType,
            item_id: item.id
          });
        }
      } catch (err) {
        console.error("Error fetching movie details:", err);
      }
    }

    setMovieDetails(details);
    setLoadingMovies(false);
  };

  const handleMovieClick = (movie) => {
    const mediaType = movie.media_type || "movie";
    navigate(`/movies/${movie.id}?type=${mediaType}`);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  };

  // Loading State
  if (loading) {
    return (
      <div className="shared-list-container">
        <div className="shared-list-loading">
          <div className="spinner"></div>
          <p>Loading shared list...</p>
        </div>
      </div>
    );
  }

  // Error State
  if (error || !sharedData) {
    return (
      <div className="shared-list-container">
        <div className="shared-list-error">
          <AlertCircle size={64} />
          <h2>Shared List Not Found</h2>
          <p>{error || "This share link may have expired or been revoked."}</p>
          <button 
            className="shared-list-error__btn"
            onClick={() => navigate("/")}
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  // Success State
  return (
    <div className="shared-list-container">
      
      {/* Header Section */}
      <div className="shared-list-header">
        <div className="shared-list-header__icon">
          <Share2 size={32} />
        </div>
        
        <h1 className="shared-list-header__title">{sharedData.title}</h1>
        
        {sharedData.description && (
          <p className="shared-list-header__description">
            {sharedData.description}
          </p>
        )}

        <div className="shared-list-header__meta">
          <div className="shared-list-meta-item">
            <Calendar size={18} />
            <span>Shared on {formatDate(sharedData.sharedAt)}</span>
          </div>

          {sharedData.expiresAt && (
            <div className="shared-list-meta-item">
              <Calendar size={18} />
              <span>Expires {formatDate(sharedData.expiresAt)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Content Section */}
      <div className="shared-list-content">
        
        {/* Empty State */}
        {sharedData.items.length === 0 && (
          <div className="shared-list-empty">
            <Share2 size={64} opacity={0.3} />
            <p>This list doesn't have any movies or TV shows yet.</p>
          </div>
        )}

        {/* Loading Movies */}
        {loadingMovies && (
          <div className="shared-list-movies-loading">
            <div className="spinner"></div>
            <p>Loading movies...</p>
          </div>
        )}

        {/* Movies Grid */}
        {!loadingMovies && movieDetails.length > 0 && (
          <div className="shared-list-grid">
            {movieDetails.map((movie) => (
              <div
                key={movie.item_id}
                className="shared-list-card"
                onClick={() => handleMovieClick(movie)}
              >
                <div className="shared-list-card__poster">
                  {movie.poster_path ? (
                    <GetImage
                      path={movie.poster_path}
                      title={movie.title || movie.name}
                      size="w342"
                    />
                  ) : (
                    <div className="shared-list-card__placeholder">
                      No Image
                    </div>
                  )}
                </div>

                <div className="shared-list-card__info">
                  <h4 className="shared-list-card__title">
                    {movie.title || movie.name}
                  </h4>
                  
                  <div className="shared-list-card__meta">
                    <span className="shared-list-card__type">
                      {movie.media_type === "tv" ? "TV Show" : "Movie"}
                    </span>
                    
                    {movie.vote_average && (
                      <span className="shared-list-card__rating">
                        ⭐ {movie.vote_average.toFixed(1)}
                      </span>
                    )}
                  </div>

                  {(movie.release_date || movie.first_air_date) && (
                    <div className="shared-list-card__year">
                      {new Date(movie.release_date || movie.first_air_date).getFullYear()}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="shared-list-footer">
        <p>Want to create your own movie lists?</p>
        <button 
          className="shared-list-footer__btn"
          onClick={() => navigate("/register")}
        >
          Sign Up Free
        </button>
      </div>
    </div>
  );
}