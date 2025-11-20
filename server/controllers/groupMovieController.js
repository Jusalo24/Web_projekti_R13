import movieService from "../services/groupMovieService.js";

// Add movie to group
// POST /api/groups/groups/:id/movies | query: { movieId, mediaType }
export async function addMovieToGroup(req, res) {
    try {
        const movie = await movieService.addMovie(
            req.params.id,
            req.query.movieId,
            req.query.mediaType,
            req.user.id
        );
        console.log(movie);
        if (!movie)
            return res.status(409).json({ error: "Movie already in group" });

        res.status(201).json({ message: "Movie added successfully" });
    } catch (err) {
        res.status(500).json({ error: "Failed to add movie" });
    }
}

// Remove movie
// DELETE /api/groups/groups/:id/movies | query: { movieId, mediaType }
export async function removeMovieFromGroup(req, res) {
    try {
        const { movieId, mediaType } = req.query;

        if (!movieId || !mediaType) {
            console.log('❌ Missing parameters');
            return res.status(400).json({
                error: "movieId and mediaType are required as query parameters"
            });
        }

        console.log('Calling removeMovie service...');
        await movieService.removeMovie(
            req.params.id,
            movieId,
            mediaType
        );

        console.log('✅ Movie removed successfully');
        res.status(201).json({ message: "Movie removed successfully" });
    } catch (err) {
        console.error('❌ Remove movie error:', err);
        res.status(500).json({ error: "Failed to remove movie", details: err.message });
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