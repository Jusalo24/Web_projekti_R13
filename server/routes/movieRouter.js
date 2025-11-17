import { Router } from 'express'
import { 
    getMovieById, 
    getMoviesByType, 
    searchMovies,
    getMovieCredits,
    getMovieVideos,
    getSimilarMovies,
    getMovieRecommendations,
    getMovieGenres,
    discoverMovies
} from '../controllers/TMDBMovieController.js'

const movieRouter = Router()

// Search movies
// GET /api/movies/search?q=avatar&page=1
movieRouter.get('/movies/search', searchMovies)

// Get movie genres
// GET /api/movies/genres
movieRouter.get('/movies/genres', getMovieGenres)

// Discover movies with filters
// GET /api/movies/discover?with_genres=28&sort_by=popularity.desc&page=1
movieRouter.get('/movies/discover', discoverMovies)

// Get movies by category (popular, now_playing, top_rated, upcoming)
// Add ?region=FI to get movies now playing in Finland
// GET /api/movies/list/:searchType?page=1&region=FI
movieRouter.get('/movies/:searchType', getMoviesByType)

// Get movie credits (cast and crew)
// GET /api/movies/:id/credits
movieRouter.get('/movies/:id/credits', getMovieCredits)

// Get movie videos (trailers, teasers)
// GET /api/movies/:id/videos
movieRouter.get('/movies/:id/videos', getMovieVideos)

// Get similar movies
// GET /api/movies/:id/similar?page=1
movieRouter.get('/movies/:id/similar', getSimilarMovies)

// Get movie recommendations
// GET /api/movies/:id/recommendations?page=1
movieRouter.get('/movies/:id/recommendations', getMovieRecommendations)

// Get movie details by ID (must be last to avoid route conflicts)
// GET /api/movies/:id
movieRouter.get('/movies/:id', getMovieById)

export default movieRouter
