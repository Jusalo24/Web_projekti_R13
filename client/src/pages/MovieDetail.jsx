import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useApi } from "../hooks/useApi";
import { useFavoritesApi } from "../hooks/useFavoritesApi";
import GetImage from "../components/GetImage";
import AddToGroupModal from "../components/AddToGroupModal";
import ReplyThread from "../components/ReplyThread";
import "../styles/movie-detail.css";

export default function MovieDetail() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Movie/TV details
  const [details, setDetails] = useState(null);
  const [credits, setCredits] = useState(null);
  const [videos, setVideos] = useState(null);
  const [similar, setSimilar] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [average, setAverage] = useState(null);

  const [mediaType, setMediaType] = useState("movie");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // UI
  const [showGroupModal, setShowGroupModal] = useState(false);

  // Favorite state
  const [isFavorite, setIsFavorite] = useState(false);
  const [checkingFavorite, setCheckingFavorite] = useState(true);

  // Review state
  const [rating, setRating] = useState("5");

  const handleRatingChange = (value) => {
  if (value === "") return setRating(""); // sallii tyhjentämisen
  const clamped = Math.min(5, Math.max(1, Number(value)));
  setRating(String(clamped));
};

  const [text, setText] = useState("");
  const [myReviewId, setMyReviewId] = useState(null);
  const [reviewError, setReviewError] = useState(null);

  const imageSize = "original";
  const baseURL = import.meta.env.VITE_API_BASE_URL;

  // Auth
  const { user, token } = useAuth();
  const isLoggedIn = !!token;

  // API helpers
  const { request } = useApi();

  // FAVORITES HOOK (keskitetty)
  const {
    notification,
    setNotification,
    addToFavorites,
    removeFromFavorites,
    isFavorite: favCheck
  } = useFavoritesApi(token);

  // Fetch details when ID or media type changes
  useEffect(() => {
    fetchDetails();
  }, [id, searchParams]);

  // Favorite check after details load
  useEffect(() => {
    if (isLoggedIn && details) checkFavorite();
  }, [details]);

  // Reviews load when details change
  useEffect(() => {
    if (details) loadReviews();
  }, [details]);

  const fetchDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      const typeParam = searchParams.get("type") || "movie";
      let currentType = typeParam;

      let dataRes;
      if (typeParam === "tv") {
        dataRes = await fetch(`${baseURL}/api/tv/${id}`);
        if (!dataRes.ok) {
          dataRes = await fetch(`${baseURL}/api/movies/byId/${id}`);
          currentType = "movie";
        }
      } else {
        dataRes = await fetch(`${baseURL}/api/movies/byId/${id}`);
        if (!dataRes.ok) {
          dataRes = await fetch(`${baseURL}/api/tv/${id}`);
          currentType = "tv";
        }
      }

      if (!dataRes.ok) {
        throw new Error("Content not found");
      }

      const detailsData = await dataRes.json();
      setDetails(detailsData);
      setMediaType(currentType);

      // Credits
      const creditsURL = currentType === "movie"
        ? `${baseURL}/api/movies/${id}/credits`
        : `${baseURL}/api/tv/${id}/credits`;
      const creditsRes = await fetch(creditsURL);
      if (creditsRes.ok) setCredits(await creditsRes.json());

      // Videos
      const videosURL = currentType === "movie"
        ? `${baseURL}/api/movies/${id}/videos`
        : `${baseURL}/api/tv/${id}/videos`;
      const videosRes = await fetch(videosURL);
      if (videosRes.ok) setVideos(await videosRes.json());

      // Similar
      const similarURL = currentType === "movie"
        ? `${baseURL}/api/movies/${id}/similar?page=1`
        : `${baseURL}/api/tv/${id}/similar?page=1`;
      const similarRes = await fetch(similarURL);
      if (similarRes.ok) {
        const sim = await similarRes.json();
        setSimilar(sim.results?.slice(0, 6) || []);
      }

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Check favorite using centralized hook
  const checkFavorite = async () => {
    try {
      setCheckingFavorite(true);
      const fav = await favCheck(mediaType, id);
      setIsFavorite(fav);
    } finally {
      setCheckingFavorite(false);
    }
  };

  const handleAddToFavorites = async () => {
    if (!isLoggedIn) {
      navigate("/login");
      return;
    }

    await addToFavorites(mediaType, id);
    setIsFavorite(true);
  };

  const handleRemoveFromFavorites = async () => {
    await removeFromFavorites(mediaType, id);
    setIsFavorite(false);
  };

  // Reviews
  const loadReviews = async () => {
    try {
      const rev = await request(
        `/api/reviews/movie/${id}?page=1&limit=20&media_type=${mediaType}`
      );
      const avg = await request(
        `/api/reviews/movie/${id}/average?media_type=${mediaType}`
      );

      setReviews(rev.reviews || []);
      setAverage(avg || null);

      if (user) {
        const mine = (rev.reviews || []).find(r => r.user_id === user.id);
        if (mine) {
          setMyReviewId(mine.id);
          setRating(mine.rating);
          setText(mine.review_text || "");
        } else {
          setMyReviewId(null);
          setRating(5);
          setText("");
        }
      }
      setReviewError(null);

    } catch (err) {
      setReviewError(err.message);
    }
  };

  const submitReview = async () => {
    if (!token) return;

    try {
      const numericRating = Math.min(5, Math.max(1, Number(rating))) || 1;
      if (myReviewId) {
        await request(`/api/reviews/${myReviewId}`, {
          method: "PUT",
          body: JSON.stringify({ rating: numericRating, review_text: text })
        });
      } else {
        await request(`/api/reviews`, {
          method: "POST",
          body: JSON.stringify({
            user_id: user.id,
            movie_external_id: id,
            media_type: mediaType,
            rating: numericRating,
            review_text: text
          })
        });
      }

      await loadReviews();
      setNotification({ message: "Review saved!", type: "success" });

    } catch (err) {
      setReviewError(err.message);
    }
  };

  const deleteReview = async () => {
    if (!myReviewId) return;
    try {
      await request(`/api/reviews/${myReviewId}`, { method: "DELETE" });
      setMyReviewId(null);
      setText("");
      setRating(5);
      await loadReviews();
      setNotification({ message: "Review deleted", type: "success" });
    } catch (err) {
      setReviewError(err.message);
    }
  };

  const getTitle = () => details?.title || details?.name || "Unknown Title";
  const getReleaseYear = () => new Date(details?.release_date || details?.first_air_date).getFullYear();
  const getRuntime = () => mediaType === "movie"
    ? `${details?.runtime || "?"} min`
    : `${details?.episode_run_time?.[0] || "?"} min/episode`;

  const getTrailer = () => videos?.results?.find(v => v.type === "Trailer" && v.site === "YouTube");

  const handleSimilarClick = (itemId, type) => {
    navigate(`/movies/${itemId}?type=${type}`);
    window.scrollTo(0, 0);
  };

  // RENDER
  if (loading) return <div className="movie-detail"><div className="movie-detail__loading">Loading...</div></div>;

  if (error || !details)
    return (
      <div className="movie-detail">
        <div className="movie-detail__error">
          <h2>Error</h2>
          <p>{error}</p>
          <button onClick={() => navigate(-1)} className="movie-detail__back-btn">← Go Back</button>
        </div>
      </div>
    );

  const trailer = getTrailer();

  return (
    <div className="movie-detail">

      {notification.message && (
        <div className={`movie-detail__notification movie-detail__notification--${notification.type}`}>
          <span>{notification.message}</span>
          <button onClick={() => setNotification({ message: null })}>✕</button>
        </div>
      )}

      <div className="movie-detail__backdrop">
        {details.backdrop_path && (
          <img
            src={`https://image.tmdb.org/t/p/original${details.backdrop_path}`}
            alt={getTitle()}
            className="movie-detail__backdrop-img"
          />
        )}
        <div className="movie-detail__backdrop-overlay"></div>
      </div>

      <div className="movie-detail__content">
        <button onClick={() => navigate(-1)} className="movie-detail__back-btn">← Back</button>

        <div className="movie-detail__main">

          <div className="movie-detail__poster">
            {details.poster_path ? (
              <GetImage path={details.poster_path} title={getTitle()} size={imageSize} />
            ) : (
              <div className="movie-detail__poster-placeholder">No Image</div>
            )}
          </div>

          <div className="movie-detail__info">

            <div className="movie-detail__header">
              <h1 className="movie-detail__title">{getTitle()}</h1>
              <span className="movie-detail__type">{mediaType === "movie" ? "Movie" : "TV Show"}</span>
            </div>

            {details.tagline && <p className="movie-detail__tagline">"{details.tagline}"</p>}

            <div className="movie-detail__meta">
              <span><strong>Year:</strong> {getReleaseYear()}</span>
              <span><strong>Runtime:</strong> {getRuntime()}</span>
              <span><strong>Rating:</strong> {details.vote_average?.toFixed(1)}</span>
            </div>

            {isLoggedIn && (
              <div className="movie-detail__actions">

                <button
                  className={`movie-detail__action-btn ${isFavorite ? "movie-detail__action-btn--active" : ""}`}
                  onClick={isFavorite ? handleRemoveFromFavorites : handleAddToFavorites}
                  disabled={checkingFavorite}
                >
                  {checkingFavorite ? "..." : isFavorite ? "❤️ Remove Favorite" : "🤍 Add Favorite"}
                </button>

                <button className="movie-detail__action-btn" onClick={() => setShowGroupModal(true)}>
                  ➕ Add to Group
                </button>

              </div>
            )}

            {details.genres && (
              <div className="movie-detail__genres">
                {details.genres.map((g) => <span key={g.id} className="movie-detail__genre">{g.name}</span>)}
              </div>
            )}

            <div className="movie-detail__overview">
              <h3>Overview</h3>
              <p>{details.overview}</p>
            </div>

          </div>
        </div>

        {trailer && (
          <div className="movie-detail__section">
            <h2>Trailer</h2>
            <iframe
              width="100%"
              height="500"
              src={`https://www.youtube.com/embed/${trailer.key}`}
              title="Trailer"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        )}

        {/* Reviews */}
        <div className="movie-detail__section">
          <h2>Reviews</h2>

          {average && (
            <p className="movie-detail__average">
              Average {average.average_rating}/5 ({average.total_reviews} reviews)
            </p>
          )}

          {reviewError && <p className="movie-detail__error">{reviewError}</p>}

          <div className="review-wrap review-grid">
            <div>
              {user ? (
                <div className="review-form">
                  <label>
                    Rating (1–5)
                    <input
                      type="number"
                      min="1"
                      max="5"
                      value={rating}
                      onChange={(e) => handleRatingChange(e.target.value)}
                    />
                  </label>
                  <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Write your thoughts..."
                  />
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <button onClick={submitReview}>
                      {myReviewId ? "Update Review" : "Post Review"}
                    </button>
                    {myReviewId && <button onClick={deleteReview}>Delete</button>}
                  </div>
                </div>
              ) : (
                <p>Login to write a review.</p>
              )}
            </div>

            <div className="reviews-list">
              {reviews.length === 0 && <p>No reviews yet.</p>}
              {reviews.map((r) => {
                const name = r.username || r.user_id || "?";
                const initial = name[0]?.toUpperCase() || "?";

                return (
                  <div key={r.id} className="review-card">
                    <div className="review-card__header">
                      <div className="review-card__user">
                        <div className="reply-avatar">{initial}</div>
                        <strong className="review-card__author">{name}</strong>
                      </div>
                      <span className="review-card__rating">{r.rating}/5</span>
                    </div>

                    <p>{r.review_text}</p>
                    <small>{new Date(r.created_at).toLocaleString()}</small>

                    {/* Replies for this review */}
                    <div className="review-card__replies" style={{ marginTop: "0.5rem" }}>
                      <ReplyThread reviewId={r.id} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Similar */}
        {similar.length > 0 && (
          <div className="movie-detail__section">
            <h2>Similar {mediaType === "movie" ? "Movies" : "TV Shows"}</h2>
            <div className="movie-detail__similar">
              {similar.map((item) => (
                <div
                  key={item.id}
                  className="movie-detail__similar-card"
                  onClick={() => handleSimilarClick(item.id, mediaType)}
                >
                  {item.poster_path ? (
                    <GetImage path={item.poster_path} title={item.title || item.name} size="w342" />
                  ) : (
                    <div className="movie-detail__similar-placeholder">No Image</div>
                  )}
                  <div className="movie-detail__similar-info">
                    <p>{item.title || item.name}</p>
                    <p>⭐ {item.vote_average?.toFixed(1)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* Group Modal */}
      {showGroupModal && (
        <AddToGroupModal
          movieId={id}
          mediaType={mediaType}
          movieTitle={getTitle()}
          onClose={() => setShowGroupModal(false)}

          onSuccess={(groupName) => {
            setShowGroupModal(false);
            setNotification({
              message: `Added to "${groupName}"!`,
              type: "success"
            });
          }}

          onError={(errorMessage) => {
            setShowGroupModal(false);
            setNotification({
              message: errorMessage,
              type: "error"
            });
          }}
        />
      )}
    </div>
  );
}
