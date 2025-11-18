import { useEffect, useState } from "react";

export default function GetGenre({ onSelect, selectedGenre }) {
    const [genres, setGenres] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const baseURL = import.meta.env.VITE_API_BASE_URL;

    useEffect(() => {
        const fetchGenres = async () => {
            try {
                setLoading(true);
                const res = await fetch(`${baseURL}/api/genres/movie`);
                if (!res.ok) throw new Error("Failed to fetch genres");
                const data = await res.json();
                setGenres(data.genres || []);
            } catch (err) {
                console.error("Failed to fetch genres:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchGenres();
    }, []);

    const handleChange = (e) => {
        const value = e.target.value;
        if (onSelect) onSelect(value);
    };

    if (loading) {
        return (
            <select className="filter-group__select" disabled>
                <option>Loading genres...</option>
            </select>
        );
    }

    if (error) {
        return (
            <select className="filter-group__select" disabled>
                <option>Error loading genres</option>
            </select>
        );
    }

    return (
        <select
            className="filter-group__select"
            value={selectedGenre || ""}
            onChange={handleChange}
        >
            <option value="">All Genres</option>
            {genres.map((genre) => (
                <option key={genre.id} value={genre.id}>
                    {genre.name}
                </option>
            ))}
        </select>
    );
}