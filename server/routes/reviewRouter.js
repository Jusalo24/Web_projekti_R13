import { Router } from 'express'
import { 
    createReview, 
    getReviewsByMovieId, 
    getReviewsByUserId,
    updateReview,
    deleteReview,
    getMovieAverageRating
} from '../controllers/reviewController.js'
import { auth } from '../helpers/auth.js'

const reviewRouter = Router()

// Get reviews for a specific movie (public)
// GET /api/reviews/movie/:movieId?page=1&limit=10
reviewRouter.get('/reviews/movie/:movieId', getReviewsByMovieId)

// Get average rating for a movie (public)
// GET /api/reviews/movie/:movieId/average
reviewRouter.get('/reviews/movie/:movieId/average', getMovieAverageRating)

// Get all reviews by a specific user (public)
// GET /api/reviews/user/:userId?page=1&limit=10
reviewRouter.get('/reviews/user/:userId', getReviewsByUserId)

// Create a new review (protected)
// POST /api/reviews
// Body: { user_id, movie_external_id, rating, review_text }
reviewRouter.post('/reviews', auth, createReview)

// Update a review (protected)
// PUT /api/reviews/:id
// Body: { rating, review_text }
reviewRouter.put('/reviews/:id', auth, updateReview)

// Delete a review (protected)
// DELETE /api/reviews/:id
reviewRouter.delete('/reviews/:id', auth, deleteReview)

export default reviewRouter
