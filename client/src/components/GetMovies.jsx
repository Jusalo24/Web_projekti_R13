import { useEffect, useState } from "react";
import GetImage from "./GetImage";

export default function GetMovies({
    type = "now_playing",
    page = 1,
    imageSize = "w500",
    limit = null,
    query = "",
    ...discoverParams
    
}) {
    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const baseURL = import.meta.env.VITE_API_BASE_URL;

    useEffect(() => {
        const fetchMovies = async () => {
            try {
                setLoading(true);

                let url = "";

                if (query) {
                    // search endpoint
                    url = `${baseURL}/api/movies/search?q=${encodeURIComponent(query)}&page=${page}`;
                } else if (type === "discover") {
                    // discover endpoint
                    const queryString = new URLSearchParams({ page, ...discoverParams }).toString();
                    url = `${baseURL}/api/movies/discover?${queryString}`;
                } else {
                    // regular type endpoint
                    url = `${baseURL}/api/movies/${type}?page=${page}`;
                }

                const response = await fetch(url);
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

                const data = await response.json();
                let results = data.results || [];
                if (limit) results = results.slice(0, limit);

                setMovies(results);
            } catch (err) {
                console.error("Error fetching movies:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchMovies();
    }, [type, page, limit, query, JSON.stringify(discoverParams)]); 
    // JSON.stringify -> jotta useEffect havaitsee objektimuutokset

    if (loading) return <div className="movies-loading">Loading movies...</div>;
    if (error) return <div className="movies-error">Error: {error}</div>;
    if (movies.length === 0) return <div className="movies-empty">No movies found.</div>;

    return (
        <div className="movies-grid">
            {movies.map((movie) => (
                <div key={movie.id} className="movie-card">
                    <div className="movie-card__poster">
                        <GetImage
                            path={movie.poster_path}
                            title={movie.title}
                            size={imageSize}
                        />
                    </div>
                    <div className="movie-card__info">
                        <h3 className="movie-card__title">{movie.title}</h3>
                        <div className="movie-card__meta">
                            <span className="movie-card__rating">
                                ⭐ {movie.vote_average?.toFixed(1)}
                            </span>
                            <span className="movie-card__date">
                                📅 {movie.release_date}
                            </span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
