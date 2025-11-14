import { Router } from 'express'
import { getMovieGenres, getTVGenres, discoverTV } from '../controllers/genreController.js'

const genreRouter = Router()

// Get all movie genres
// GET /api/genres/movie
genreRouter.get('/genres/movie', getMovieGenres)

// Get all TV genres
// GET /api/genres/tv
genreRouter.get('/genres/tv', getTVGenres)

// Discover TV shows with filters
// GET /api/discover/tv?with_genres=10765&sort_by=popularity.desc&page=1
genreRouter.get('/discover/tv', discoverTV)

export default genreRouter