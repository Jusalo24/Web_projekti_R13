import { Router } from 'express'
import { getMovieById, getMoviesByType, searchMovies } from '../controllers/TMBDMovieController.js'

const movieRouter = Router()

const TMDB_BASE = 'https://api.themoviedb.org/3'

// Search movies GET /api/movies/search?q=query
movieRouter.get('/movies/search', searchMovies)

// Hae elokuvia kategorian perusteella (popular, now_playing, top_rated, latest, upcoming) lisää query "?region=FI" niin saat nyt elokuvateattereissa Suomessa
movieRouter.get('/movies/list/:searchType', getMoviesByType)

// Hae elokuvan tiedot ID:n perusteella
movieRouter.get('/movies/:id', getMovieById)

export default movieRouter