import { useEffect, useState } from "react"

export default function GetNowPlayingMovies({ region = "FI", page = 1 }) {
    const [movies, setMovies] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        const fetchMovies = async () => {
            try {
                const response = await fetch(`http://localhost:3001/api/movies/now_playing?region=${region}&page=${page}`)
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
                const data = await response.json()
                setMovies(data.results || [])
            } catch (err) {
                console.error("Error fetching movies:", err)
                setError(err.message)
            } finally {
                setLoading(false)
            }
        }

        fetchMovies()
    }, [region, page])

    if (loading) return <p>Loading movies...</p>
    if (error) return <p>Error: {error}</p>
    if (movies.length === 0) return <p>No movies found.</p>

    return (
        <div className="movie-list">
            {movies.map((movie) => (
                <div key={movie.id} className="movie-box">
                    <img
                        src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                        alt={movie.title}
                        style={{ width: "150px", borderRadius: "8px" }}
                    />
                    <h4>{movie.title}</h4>
                    <p>⭐ {movie.vote_average.toFixed(1)}</p>
                    <p>📅 {movie.release_date}</p>
                </div>
            ))}
        </div>
    )
}
