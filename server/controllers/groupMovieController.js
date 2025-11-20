import movieService from "../services/groupMovieService.js";

// Add movie to group
// POST /api/groups/groups/:id/movies | body: { movieId }
export async function addMovieToGroup(req, res) {
    try {
        const movie = await movieService.addMovie(
            req.params.id,
            req.body.movieId,
            req.user.id
        );

        if (!movie)
            return res.status(409).json({ error: "Movie already in group" });

        res.status(201).json(movie);
    } catch (err) {
        res.status(500).json({ error: "Failed to add movie" });
    }
}

// Remove movie
export async function removeMovieFromGroup(req, res) {
    try {
        await movieService.removeMovie(req.params.id, req.params.movieId);
        res.status(204).send();
    } catch (err) {
        res.status(500).json({ error: "Failed to remove movie" });
    }
}

// Get movies in group
export async function getMoviesInGroup(req, res) {
    try {
        const movies = await movieService.getMovies(req.params.id);
        res.json(movies);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch movies" });
    }
}