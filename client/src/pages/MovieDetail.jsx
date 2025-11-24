import { useEffect, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useApi } from "../hooks/useApi";
import GetImage from "../components/GetImage";
import "../styles/movie-detail.css";

export default function MovieDetail() {
  const { id } = useParams(); // Get movie/TV ID from URL
  const [searchParams] = useSearchParams(); // Get query parameters
  const navigate = useNavigate();
  const [details, setDetails] = useState(null);
  const [credits, setCredits] = useState(null);
  const [videos, setVideos] = useState(null);
  const [similar, setSimilar] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mediaType, setMediaType] = useState("movie"); // Default to movie
  const imageSize = "original"; // Size of poster images: w780, w500, w342, w185, w154, w92, original
  
  const { user, token } = useAuth(); // Get authenticated user
  const { request } = useApi(); // Custom hook for API requests

  // Review states (UI uses 0-10, backend expects 1-5 -> mapped on submit)
  const [reviews, setReviews] = useState([]);
  const [average, setAverage] = useState(null);
  const [rating, setRating] = useState(5);
  const [text, setText] = useState("");
  const [myReviewId, setMyReviewId] = useState(null);
  const [reviewError, setReviewError] = useState(null);

  const baseURL = import.meta.env.VITE_API_BASE_URL;

  // Determine if this is a movie or TV show based on query parameter
  useEffect(() => {
    fetchDetails();
  }, [id, searchParams]);

  // Load reviews when details or user changes
  useEffect(() => {
  if (details) {loadReviews();}
  }, [details, user]);


  const fetchDetails = async () => {
    try {
      setLoading(true);
      setError(null); // Clear previous errors
      
      // Get media type from query parameter, default to 'movie'
      const typeParam = searchParams.get('type') || 'movie';
      let currentMediaType = typeParam;
      
      // Fetch based on the media type
      let detailsRes;
      let detailsData;
      
      if (typeParam === 'tv') {
        detailsRes = await fetch(`${baseURL}/api/tv/${id}`);
        
        // If TV fetch fails, try as movie
        if (!detailsRes.ok) {
          detailsRes = await fetch(`${baseURL}/api/movies/byId/${id}`);
          currentMediaType = "movie";
        }
      } else {
        detailsRes = await fetch(`${baseURL}/api/movies/byId/${id}`);
        
        // If movie fetch fails, try as TV
        if (!detailsRes.ok) {
          detailsRes = await fetch(`${baseURL}/api/tv/${id}`);
          currentMediaType = "tv";
        }
      }
      
      // If both attempts failed, show error
      if (!detailsRes.ok) {
        const errorData = await detailsRes.json().catch(() => ({}));
        throw new Error(errorData.error || "Content not found");
      }
      
      detailsData = await detailsRes.json();
      
      setMediaType(currentMediaType);
      setDetails(detailsData);
      setDetails(detailsData);

      // Fetch credits
      const creditsEndpoint = currentMediaType === "movie" 
        ? `${baseURL}/api/movies/${id}/credits`
        : `${baseURL}/api/tv/${id}/credits`;
      const creditsRes = await fetch(creditsEndpoint);
      if (creditsRes.ok) {
        const creditsData = await creditsRes.json();
        setCredits(creditsData);
      }

      // Fetch videos
      const videosEndpoint = currentMediaType === "movie"
        ? `${baseURL}/api/movies/${id}/videos`
        : `${baseURL}/api/tv/${id}/videos`;
      const videosRes = await fetch(videosEndpoint);
      if (videosRes.ok) {
        const videosData = await videosRes.json();
        setVideos(videosData);
      }

      // Fetch similar content
      const similarEndpoint = currentMediaType === "movie"
        ? `${baseURL}/api/movies/${id}/similar?page=1`
        : `${baseURL}/api/tv/${id}/similar?page=1`;
      const similarRes = await fetch(similarEndpoint);
      if (similarRes.ok) {
        const similarData = await similarRes.json();
        setSimilar(similarData.results?.slice(0, 6) || []);
      }

    } catch (err) {
      console.error("Error fetching details:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadReviews = async () => {
    try {
      const rev = await request(`/api/reviews/movie/${id}?page=1&limit=20`);
      const avg = await request(`/api/reviews/movie/${id}/average`);
      setReviews(rev.reviews || []);
      setAverage(avg || null);

      if (user) {
        const mine = (rev.reviews || []).find(r => r.user_id === user.id);
        if (mine) {
          setMyReviewId(mine.id);
          setRating(Math.min(10, mine.rating * 2)); // map stored 1-5 scale to UI 0-10
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
    if (!token) { setReviewError("Login required"); return; }
    try {
      const normalizedRating = Math.max(1, Math.min(5, Math.round(rating / 2)));

      if (myReviewId) {
        await request(`/api/reviews/${myReviewId}`, {
          method: "PUT",
          body: JSON.stringify({ rating: normalizedRating, review_text: text })
        });
      } else {
        await request(`/api/reviews`, {
          method: "POST",
          body: JSON.stringify({
            user_id: user.id,
            movie_external_id: id,
            rating: normalizedRating,
            review_text: text
          })
        });
      }
      await loadReviews();
    } catch (err) {
      setReviewError(err.message);
    }
  };

  const deleteReview = async () => {
    if (!token || !myReviewId) return;
    try {
      await request(`/api/reviews/${myReviewId}`, { method: "DELETE" });
      setMyReviewId(null);
      setRating(5);
      setText("");
      await loadReviews();
    } catch (err) {
      setReviewError(err.message);
    }
  };


  const getTitle = () => {
    return details?.title || details?.name || "Unknown Title";
  };

  const getReleaseYear = () => {
    const date = details?.release_date || details?.first_air_date;
    return date ? new Date(date).getFullYear() : "N/A";
  };

  const getRuntime = () => {
    if (mediaType === "movie") {
      return details?.runtime ? `${details.runtime} min` : "N/A";
    } else {
      return details?.episode_run_time?.[0] 
        ? `${details.episode_run_time[0]} min/episode` 
        : "N/A";
    }
  };

  const getTrailer = () => {
    if (!videos?.results) return null;
    return videos.results.find(
      (video) => video.type === "Trailer" && video.site === "YouTube"
    );
  };

  const handleSimilarClick = (itemId, itemMediaType) => {
    // Determine media type from the item or use current media type as fallback
    const targetMediaType = itemMediaType || mediaType;
    navigate(`/movies/${itemId}?type=${targetMediaType}`);
    window.scrollTo(0, 0);
  };

  if (loading) {
    return (
      <div className="movie-detail">
        <div className="movie-detail__loading">Loading...</div>
      </div>
    );
  }

  if (error || !details) {
    return (
      <div className="movie-detail">
        <div className="movie-detail__error">
          <h2>Unable to Load Content</h2>
          <p>{error || "This content may not be available or the ID is invalid."}</p>
          <p className="movie-detail__error-hint">
            This might happen if the content is very new or has been removed from the database.
          </p>
          <button onClick={() => navigate(-1)} className="movie-detail__back-btn">
            ← Go Back
          </button>
        </div>
      </div>
    );
  }

  const trailer = getTrailer();

  return (
    <div className="movie-detail">
      {/* Backdrop Section */}
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

      {/* Main Content */}
      <div className="movie-detail__content">
        <button onClick={() => navigate(-1)} className="movie-detail__back-btn">
          ← Back
        </button>

        <div className="movie-detail__main">
          {/* Poster */}
          <div className="movie-detail__poster">
            {details.poster_path ? (
              <GetImage
                path={details.poster_path}
                title={getTitle()}
                size={imageSize}
              />
            ) : (
              <div className="movie-detail__poster-placeholder">No Image</div>
            )}
          </div>

          {/* Info Section */}
          <div className="movie-detail__info">
            <div className="movie-detail__header">
              <h1 className="movie-detail__title">{getTitle()}</h1>
              <span className="movie-detail__type">
                {mediaType === "movie" ? "Movie" : "TV Show"}
              </span>
            </div>

            {details.tagline && (
              <p className="movie-detail__tagline">"{details.tagline}"</p>
            )}

            <div className="movie-detail__meta">
              <span className="movie-detail__meta-item">
                <strong>Year:</strong> {getReleaseYear()}
              </span>
              <span className="movie-detail__meta-item">
                <strong>Runtime:</strong> {getRuntime()}
              </span>
              <span className="movie-detail__meta-item">
                <strong>Rating:</strong> {details.vote_average?.toFixed(1) || "N/A"} / 10
              </span>
              {mediaType === "tv" && details.number_of_seasons && (
                <span className="movie-detail__meta-item">
                  <strong>Seasons:</strong> {details.number_of_seasons}
                </span>
              )}
            </div>

            {/* Genres */}
            {details.genres && details.genres.length > 0 && (
              <div className="movie-detail__genres">
                {details.genres.map((genre) => (
                  <span key={genre.id} className="movie-detail__genre">
                    {genre.name}
                  </span>
                ))}
              </div>
            )}

            {/* Overview */}
            <div className="movie-detail__overview">
              <h3>Overview</h3>
              <p>{details.overview || "No overview available."}</p>
            </div>

            {/* Production Companies */}
            {details.production_companies && details.production_companies.length > 0 && (
              <div className="movie-detail__companies">
                <h4>Production Companies</h4>
                <div className="movie-detail__companies-list">
                  {details.production_companies.map((company) => (
                    <span key={company.id} className="movie-detail__company">
                      {company.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Trailer Section */}
        {trailer && (
          <div className="movie-detail__section">
            <h2 className="movie-detail__section-title">Trailer</h2>
            <div className="movie-detail__trailer">
              <iframe
                width="100%"
                height="500"
                src={`https://www.youtube.com/embed/${trailer.key}`}
                title={trailer.name}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          </div>
        )}

        {/* Cast Section */}
        {credits?.cast && credits.cast.length > 0 && (
          <div className="movie-detail__section">
            <h2 className="movie-detail__section-title">Top Cast</h2>
            <div className="movie-detail__cast">
              {credits.cast.slice(0, 12).map((person) => (
                <div key={person.id} className="movie-detail__cast-card">
                  {person.profile_path ? (
                    <img
                      src={`https://image.tmdb.org/t/p/w185${person.profile_path}`}
                      alt={person.name}
                      className="movie-detail__cast-img"
                    />
                  ) : (
                    <div className="movie-detail__cast-placeholder">No Photo</div>
                  )}
                  <div className="movie-detail__cast-info">
                    <p className="movie-detail__cast-name">{person.name}</p>
                    <p className="movie-detail__cast-character">{person.character}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Similar Content Section */}
        {similar.length > 0 && (
          <div className="movie-detail__section">
            <h2 className="movie-detail__section-title">Similar {mediaType === "movie" ? "Movies" : "TV Shows"}</h2>
            <div className="movie-detail__similar">
              {similar.map((item) => (
                <div
                  key={item.id}
                  className="movie-detail__similar-card"
                  onClick={() => handleSimilarClick(item.id, mediaType)}
                >
                  {item.poster_path ? (
                    <GetImage
                      path={item.poster_path}
                      title={item.title || item.name}
                      size="w342"
                    />
                  ) : (
                    <div className="movie-detail__similar-placeholder">No Image</div>
                  )}
                  <div className="movie-detail__similar-info">
                    <p className="movie-detail__similar-title">
                      {item.title || item.name}
                    </p>
                    <p className="movie-detail__similar-rating">
                      ⭐ {item.vote_average?.toFixed(1) || "N/A"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
<div className="movie-detail__section">
  <h2 className="movie-detail__section-title">Reviews</h2>

  {average && (
    <p className="movie-detail__average">
      Avg {(average.average_rating * 2).toFixed(1)}/10 ({average.total_reviews} reviews)
    </p>
  )}

  {reviewError && (
    <p className="movie-detail__error">{reviewError}</p>
  )}

  <div className="review-wrap review-grid">
    {/* Vasen puoli: lomake */}
    <div>
      {user ? (
        <div className="review-form">
          <label>
            Rating
            <input
              type="number"
              min="0"
              max="10"
              value={rating}
              onChange={(e) => setRating(Number(e.target.value))}
            />
          </label>

          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Write your thoughts..."
          />

          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button onClick={submitReview}>
              {myReviewId ? "Update review" : "Post review"}
            </button>
            {myReviewId && (
              <button onClick={deleteReview}>Delete my review</button>
            )}
          </div>
        </div>
      ) : (
        <p>Login to write a review.</p>
      )}
    </div>

    {/* Oikea puoli: arvostelulista */}
    <div className="reviews-list">
      {reviews.length === 0 && <p>No reviews yet.</p>}
      {reviews.map((r) => (
        <div key={r.id} className="review-card">
          <div className="review-card__header">
            <strong>{r.username || r.user_id}</strong>
            <span className="review-card__rating">{(r.rating * 2).toFixed(1)}/10</span>
          </div>
          <p>{r.review_text || "(no text)"}</p>
          <small>{new Date(r.created_at).toLocaleString()}</small>
        </div>
      ))}
    </div>
  </div>
</div>


      </div>
    </div>
  );
}
