import { useEffect, useState } from "react"
import GetImage from "./GetImage";

export default function GetMovies({ region = "FI", page = 1, imageSize = "w500", type = "now_playing", limit = null }) { // Image sizes from API w780, w500, w342, w185, w154, w92, original
    const [movies, setMovies] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        const fetchMovies = async () => {
            try {
                const response = await fetch(`http://localhost:3001/api/movies/${type}?region=${region}&page=${page}`)
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
                const data = await response.json()
                let results = data.results || []
                if (limit) results = results.slice(0, limit)
                setMovies(results)
            } catch (err) {
                console.error("Error fetching movies:", err)
                setError(err.message)
            } finally {
                setLoading(false)
            }
        }

        fetchMovies()
    }, [region, page, type])

    if (loading) return <p>Loading movies...</p>
    if (error) return <p>Error: {error}</p>
    if (movies.length === 0) return <p>No movies found.</p>

    return (
        <div className="movie-list">
            {movies.map((movie) => (
                <div key={movie.id} className="movie-box">
                    <GetImage path={movie.poster_path} title={movie.title} size={imageSize} />
                    <h4>{movie.title}</h4>
                    <p>⭐ {movie.vote_average.toFixed(1)}</p>
                    <p>📅 {movie.release_date}</p>
                </div>
            ))}
        </div>
    )
}