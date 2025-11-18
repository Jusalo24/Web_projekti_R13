import { useEffect, useState } from "react";
import GetImage from "./GetImage";

export default function GetMovies({
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

    const baseURL = import.meta.env.VITE_API_BASE_URL;

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
                        url = `${baseURL}/api/movies/discover?${queryString}`;
                    } else {
                        url = `${baseURL}/api/movies/${type}?page=${p}`;
                    }

                    const response = await fetch(url);
                    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

                    const data = await response.json();
                    const results = data.results || [];

                    allResults.push(...results);
                }

                // limit jos annettu
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
                                {movie.release_date.slice(0, 4)}
                            </span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
