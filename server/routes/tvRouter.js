import { Router } from 'express'
import { 
    getTVById, 
    getTVByType, 
    searchTV, 
    getTVSeason,
    getTVCredits,
    getTVVideos,
    getSimilarTV,
    getTVRecommendations,
    discoverTV
} from '../controllers/TMDBTVController.js'

const tvRouter = Router()

// Search TV shows
// GET /api/tv/search?q=breaking+bad&page=1
tvRouter.get('/tv/search', searchTV)

// Get TV shows by category (popular, top_rated, on_the_air, airing_today)
// GET /api/tv/list/:searchType?page=1
tvRouter.get('/tv/list/:searchType', getTVByType)

// Get TV show season details
// GET /api/tv/:id/season/:season_number
tvRouter.get('/tv/:id/season/:season_number', getTVSeason)

// Discover tv shows with filters
// GET /api/tv/discover?with_genres=28&sort_by=popularity.desc&page=1
tvRouter.get('/tv/discover', discoverTV)

// Get TV show credits
// GET /api/tv/:id/credits
tvRouter.get('/tv/:id/credits', getTVCredits)

// Get TV show videos
// GET /api/tv/:id/videos
tvRouter.get('/tv/:id/videos', getTVVideos)

// Get similar TV shows
// GET /api/tv/:id/similar?page=1
tvRouter.get('/tv/:id/similar', getSimilarTV)

// Get TV show recommendations
// GET /api/tv/:id/recommendations?page=1
tvRouter.get('/tv/:id/recommendations', getTVRecommendations)

// Get TV show details by ID (must be last to avoid conflicts)
// GET /api/tv/:id
tvRouter.get('/tv/:id', getTVById)

export default tvRouter
