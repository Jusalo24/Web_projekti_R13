import GetImage from "./GetImage";
import { useSearchApi, movieHelpers } from "../hooks/useSearchApi";

export default function GetMoviesSeries({
  type = "now_playing",
  page = 1,
  pages = 1,
  imageSize = "w500",
  limit = null,
  query = "",
  ...discoverParams
}) {
  const { movies, loading, error } = useSearchApi({
    type,
    page,
    pages,
    limit,
    query,
    discoverParams
  });

  const { media_type } = discoverParams;

  if (loading) return <div className="movies-loading">Loading...</div>;
  if (error) return <div className="movies-error">Error: {error}</div>;
  if (movies.length === 0) return <div className="movies-empty">No results found.</div>;

  return (
    <div className="movies-grid">
      {movies.map((movie) => {
        const uniqueKey = movieHelpers.getUniqueKey(movie, media_type);

        return (
          <div key={uniqueKey} className="movie-card">
            <div className="movie-card__poster">
              <GetImage
                path={movie.poster_path}
                title={movieHelpers.getTitle(movie)}
                size={imageSize}
              />
            </div>
            <div className="movie-card__info">
              <h3 className="movie-card__title">{movieHelpers.getTitle(movie)}</h3>
              <div className="movie-card__footer">
                <span className="movie-card__type">
                  {movieHelpers.getMediaTypeLabel(movie, media_type)}
                </span>
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