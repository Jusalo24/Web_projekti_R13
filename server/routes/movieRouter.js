import { Router } from 'express'
import { getMovieById, getMoviesByType } from '../controllers/TMBDMovieController.js'

const movieRouter = Router()

const TMDB_BASE = 'https://api.themoviedb.org/3'

// Hae elokuvia kategorian perusteella (popular, now_playing, top_rated, latest, upcoming) lisää query "?region=FI" niin saat nyt elokuvateattereissa Suomessa
movieRouter.get('/MoviesByType/:searchType/:page', getMoviesByType)

// Hae elokuvan tiedot ID:n perusteella
movieRouter.get('/DetailsById/:movieId', getMovieById)

export default movieRouter