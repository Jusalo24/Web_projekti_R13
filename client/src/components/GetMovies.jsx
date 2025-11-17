import { useEffect, useState } from "react";
import GetImage from "./GetImage";

export default function GetMovies({ query = "", region = "", page = 1, imageSize = "w500", type = "now_playing", limit = null }) {
    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchMovies = async () => {
            try {
                setLoading(true);

                const url = query
                    ? `http://localhost:3001/api/movies/search?q=${encodeURIComponent(query)}&page=${page}`
                    : `http://localhost:3001/api/movies/${type}?region=${region}&page=${page}`;

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
    }, [query, region, page, type]);

    if (loading) return <p>Loading movies...</p>;
    if (error) return <p>Error: {error}</p>;
    if (movies.length === 0) return <p>No movies found.</p>;

    return (
        <div className="movie-list">
            {movies.map((movie) => (
                <div key={movie.id} className="movie-box">
                    <GetImage path={movie.poster_path} title={movie.title} size={imageSize} />
                    <h4>{movie.title}</h4>
                    <p>⭐ {movie.vote_average?.toFixed(1)}</p>
                    <p>📅 {movie.release_date}</p>
                </div>
            ))}
        </div>
    );
}