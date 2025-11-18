import { Router } from 'express'
import { 
    multiSearch, 
    searchPerson, 
    getPersonById,
    getPersonMovieCredits,
    getPersonTVCredits,
    getTrending
} from '../controllers/searchController.js'

const searchRouter = Router()

// Multi-search (movies, TV shows, people)
// GET /api/search/multi?q=avatar&page=1
searchRouter.get('/search/multi', multiSearch)

// Search people
// GET /api/search/person?q=tom+cruise&page=1
searchRouter.get('/search/person', searchPerson)

// Get trending content
// GET /api/trending/:media_type/:time_window?page=1
// media_type: all, movie, tv, person
// time_window: day, week
searchRouter.get('/trending/:media_type/:time_window', getTrending)

// Get person movie credits
// GET /api/person/:id/movie_credits
searchRouter.get('/person/:id/movie_credits', getPersonMovieCredits)

// Get person TV credits
// GET /api/person/:id/tv_credits
searchRouter.get('/person/:id/tv_credits', getPersonTVCredits)

// Get person details by ID (must be last to avoid conflicts)
// GET /api/person/:id
searchRouter.get('/person/:id', getPersonById)

export default searchRouter
