import pool from '../helpers/db.js'

/**
 * Create a new review
 * POST /api/reviews
 * Body: { user_id, movie_external_id, rating, review_text }
 */
export const createReview = async (req, res) => {
    try {
        const { user_id, movie_external_id, media_type, rating, review_text } = req.body

        // Validate required fields
        if (!user_id || !movie_external_id || !rating) {
            return res.status(400).json({
                error: 'user_id, movie_external_id, media_type, and rating are required'
            })
        }

        if (!['movie', 'tv'].includes(media_type)) {
            return res.status(400).json({
                error: 'media_type must be either "movie" or "tv"'
            })
        }

        // Validate rating range
        if (rating < 1 || rating > 5) {
            return res.status(400).json({
                error: 'Rating must be between 1 and 5'
            })
        }

        const result = await pool.query(
            `INSERT INTO reviews (user_id, movie_external_id, media_type, rating, review_text)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING id, user_id, movie_external_id, media_type, rating, review_text, created_at`,
            [user_id, movie_external_id, media_type, rating, review_text]
        )

        res.status(201).json(result.rows[0])
    } catch (err) {
        // Handle unique constraint violation (duplicate review)
        if (err.code === '23505') {
            return res.status(409).json({
                error: 'You have already reviewed this movie'
            })
        }
        console.error('Error creating review:', err.message)
        res.status(500).json({ error: 'Failed to create review' })
    }
}

/**
 * Get reviews for a specific movie
 * GET /api/reviews/movie/:movieId
 */
export const getReviewsByMovieId = async (req, res) => {
    try {
        const { movieId } = req.params
        const { page = 1, limit = 10, media_type } = req.query

        if (!media_type || !['movie', 'tv'].includes(media_type)) {
            return res.status(400).json({
                error: 'Valid media_type (movie or tv) is required'
            })
        }

        const pageNum = parseInt(page, 10)
        const limitNum = parseInt(limit, 10)

        if (isNaN(pageNum) || pageNum < 1 || isNaN(limitNum) || limitNum < 1) {
            return res.status(400).json({
                error: 'Page and limit must be positive integers'
            })
        }

        const offset = (pageNum - 1) * limitNum

        // Get reviews with user information
        const result = await pool.query(
            `SELECT
                r.id,
                r.user_id,
                r.movie_external_id,
                r.media_type,
                r.rating,
                r.review_text,
                r.created_at,
                u.username
             FROM reviews r
             LEFT JOIN users u ON r.user_id = u.id
             WHERE r.movie_external_id = $1
             AND r.media_type = $2
             ORDER BY r.created_at DESC
             LIMIT $3 OFFSET $4`,
            [movieId, media_type, limitNum, offset]
        )

        // Get total count for pagination
        const countResult = await pool.query(
            'SELECT COUNT(*) FROM reviews WHERE movie_external_id = $1 AND media_type = $2',
            [movieId, media_type]
        )

        const totalReviews = parseInt(countResult.rows[0].count, 10)
        const totalPages = Math.ceil(totalReviews / limitNum)

        res.status(200).json({
            reviews: result.rows,
            pagination: {
                currentPage: pageNum,
                totalPages,
                totalReviews,
                limit: limitNum
            }
        })
    } catch (err) {
        console.error('Error fetching reviews:', err.message)
        res.status(500).json({ error: 'Failed to fetch reviews' })
    }
}

/**
 * Get all reviews by a specific user
 * GET /api/reviews/user/:userId
 */
export const getReviewsByUserId = async (req, res) => {
    try {
        const { userId } = req.params
        const { page = 1, limit = 10 } = req.query

        const pageNum = parseInt(page, 10)
        const limitNum = parseInt(limit, 10)

        if (isNaN(pageNum) || pageNum < 1 || isNaN(limitNum) || limitNum < 1) {
            return res.status(400).json({
                error: 'Page and limit must be positive integers'
            })
        }

        const offset = (pageNum - 1) * limitNum

        const result = await pool.query(
            `SELECT
                id,
                user_id,
                movie_external_id,
                media_type,
                rating,
                review_text,
                created_at
             FROM reviews
             WHERE user_id = $1
             ORDER BY created_at DESC
             LIMIT $2 OFFSET $3`,
            [userId, limitNum, offset]
        )

        const countResult = await pool.query(
            'SELECT COUNT(*) FROM reviews WHERE user_id = $1',
            [userId]
        )

        const totalReviews = parseInt(countResult.rows[0].count, 10)
        const totalPages = Math.ceil(totalReviews / limitNum)

        res.status(200).json({
            reviews: result.rows,
            pagination: {
                currentPage: pageNum,
                totalPages,
                totalReviews,
                limit: limitNum
            }
        })
    } catch (err) {
        console.error('Error fetching user reviews:', err.message)
        res.status(500).json({ error: 'Failed to fetch user reviews' })
    }
}

/**
 * Update a review
 * PUT /api/reviews/:id
 * Body: { rating, review_text }
 */
export const updateReview = async (req, res) => {
    try {
        const { id } = req.params
        const { rating, review_text } = req.body

        // Validate rating if provided
        if (rating !== undefined && (rating < 1 || rating > 5)) {
            return res.status(400).json({
                error: 'Rating must be between 1 and 5'
            })
        }

        const updates = []
        const values = []
        let paramCount = 1

        if (rating !== undefined) {
            updates.push(`rating = $${paramCount++}`)
            values.push(rating)
        }

        if (review_text !== undefined) {
            updates.push(`review_text = $${paramCount++}`)
            values.push(review_text)
        }

        if (updates.length === 0) {
            return res.status(400).json({
                error: 'No fields to update'
            })
        }

        values.push(id)

        const result = await pool.query(
            `UPDATE reviews
             SET ${updates.join(', ')}
             WHERE id = $${paramCount}
             RETURNING id, user_id, movie_external_id, media_type, rating, review_text, created_at`,
            values
        )

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Review not found' })
        }

        res.status(200).json(result.rows[0])
    } catch (err) {
        console.error('Error updating review:', err.message)
        res.status(500).json({ error: 'Failed to update review' })
    }
}

/**
 * Delete a review
 * DELETE /api/reviews/:id
 */
export const deleteReview = async (req, res) => {
    try {
        const { id } = req.params

        if (!id) {
            return res.status(400).json({ error: 'Review ID is required' })
        }

        const result = await pool.query(
            'DELETE FROM reviews WHERE id = $1 RETURNING id',
            [id]
        )

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Review not found' })
        }

        res.status(200).json({
            message: 'Review deleted successfully',
            id: result.rows[0].id
        })
    } catch (err) {
        console.error('Error deleting review:', err.message)
        res.status(500).json({ error: 'Failed to delete review' })
    }
}

/**
 * Get average rating for a movie
 * GET /api/reviews/movie/:movieId/average
 */
export const getMovieAverageRating = async (req, res) => {
    try {
        const { movieId } = req.params
        const {media_type} = req.query

        if (!media_type || !['movie', 'tv'].includes(media_type)) {
            return res.status(400).json({
                error: 'Valid media_type (movie or tv) is required'
            })
        }

        if (!movieId) {
            return res.status(400).json({ error: 'Movie ID is required' })
        }

        const result = await pool.query(
            `SELECT
                AVG(rating)::NUMERIC(10,2) as average_rating,
                COUNT(*) as total_reviews
             FROM reviews
             WHERE movie_external_id = $1
             AND media_type = $2`,
            [movieId, media_type]
        )

        res.status(200).json({
            movie_external_id: movieId,
            average_rating: parseFloat(result.rows[0].average_rating) || 0,
            total_reviews: parseInt(result.rows[0].total_reviews, 10)
        })
    } catch (err) {
        console.error('Error calculating average rating:', err.message)
        res.status(500).json({ error: 'Failed to calculate average rating' })
    }
}