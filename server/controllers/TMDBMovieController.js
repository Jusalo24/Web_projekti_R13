import tmdbRequest from '../helpers/tmdbHelper.js'

// Valid search_type options
const VALID_SEARCH_TYPES = ['popular', 'now_playing', 'top_rated', 'upcoming']

/**
 * Get single movie details by ID
 * GET /api/movies/:id
 */
export const getMovieById = async (req, res) => {
    try {
        const { id } = req.params

        if (!id) {
            return res.status(400).json({ error: 'Movie ID is required' })
        }

        const movieData = await tmdbRequest(`/movie/${id}`, {
            language: 'en-US'
        })

        res.status(200).json(movieData)
    } catch (err) {
        console.error('Error fetching movie:', err.message)
        res.status(500).json({ error: 'Failed to fetch movie data' })
    }
}

/**
 * Get movies by category (popular, now_playing, etc.)
 * GET /api/movies/list/:searchType?page=1&region=FI
 */
export const getMoviesByType = async (req, res) => {
    try {
        const { searchType } = req.params
        const { region, page } = req.query

        if (!VALID_SEARCH_TYPES.includes(searchType)) {
            return res.status(400).json({
                error: `Invalid search type. Valid options are: ${VALID_SEARCH_TYPES.join(', ')}`
            })
        }

        const pageNum = page ? parseInt(page, 10) : 1
        if (isNaN(pageNum) || pageNum < 1) {
            return res.status(400).json({
                error: 'Page must be a positive integer'
            })
        }

        const params = {
            language: 'en-US',
            page: pageNum
        }

        if (region) params.region = region

        const moviesData = await tmdbRequest(`/movie/${searchType}`, params)

        res.status(200).json(moviesData)
    } catch (err) {
        console.error('Error fetching movies:', err.message)
        res.status(500).json({ error: 'Failed to fetch movies data' })
    }
}

/**
 * Search movies by query
 * GET /api/movies/search?q=avatar&page=1
 */
export const searchMovies = async (req, res) => {
    try {
        const { q, page } = req.query

        if (!q) {
            return res.status(400).json({ error: 'Query parameter "q" is required' })
        }

        const pageNum = page ? parseInt(page, 10) : 1
        if (isNaN(pageNum) || pageNum < 1) {
            return res.status(400).json({
                error: 'Page must be a positive integer'
            })
        }

        const moviesData = await tmdbRequest('/search/movie', {
            query: q,
            page: pageNum,
            language: 'en-US'
        })

        res.status(200).json(moviesData)
    } catch (err) {
        console.error('Error searching movies:', err.message)
        res.status(500).json({ error: 'Failed to search movies' })
    }
}

/**
 * Get movie credits (cast and crew)
 * GET /api/movies/:id/credits
 */
export const getMovieCredits = async (req, res) => {
    try {
        const { id } = req.params

        if (!id) {
            return res.status(400).json({ error: 'Movie ID is required' })
        }

        const creditsData = await tmdbRequest(`/movie/${id}/credits`, {
            language: 'en-US'
        })

        res.status(200).json(creditsData)
    } catch (err) {
        console.error('Error fetching movie credits:', err.message)
        res.status(500).json({ error: 'Failed to fetch movie credits' })
    }
}

/**
 * Get movie videos (trailers, teasers, etc.)
 * GET /api/movies/:id/videos
 */
export const getMovieVideos = async (req, res) => {
    try {
        const { id } = req.params

        if (!id) {
            return res.status(400).json({ error: 'Movie ID is required' })
        }

        const videosData = await tmdbRequest(`/movie/${id}/videos`, {
            language: 'en-US'
        })

        res.status(200).json(videosData)
    } catch (err) {
        console.error('Error fetching movie videos:', err.message)
        res.status(500).json({ error: 'Failed to fetch movie videos' })
    }
}

/**
 * Get similar movies
 * GET /api/movies/:id/similar?page=1
 */
export const getSimilarMovies = async (req, res) => {
    try {
        const { id } = req.params
        const { page } = req.query

        if (!id) {
            return res.status(400).json({ error: 'Movie ID is required' })
        }

        const pageNum = page ? parseInt(page, 10) : 1
        if (isNaN(pageNum) || pageNum < 1) {
            return res.status(400).json({
                error: 'Page must be a positive integer'
            })
        }

        const similarData = await tmdbRequest(`/movie/${id}/similar`, {
            language: 'en-US',
            page: pageNum
        })

        res.status(200).json(similarData)
    } catch (err) {
        console.error('Error fetching similar movies:', err.message)
        res.status(500).json({ error: 'Failed to fetch similar movies' })
    }
}

/**
 * Get movie recommendations
 * GET /api/movies/:id/recommendations?page=1
 */
export const getMovieRecommendations = async (req, res) => {
    try {
        const { id } = req.params
        const { page } = req.query

        if (!id) {
            return res.status(400).json({ error: 'Movie ID is required' })
        }

        const pageNum = page ? parseInt(page, 10) : 1
        if (isNaN(pageNum) || pageNum < 1) {
            return res.status(400).json({
                error: 'Page must be a positive integer'
            })
        }

        const recommendationsData = await tmdbRequest(`/movie/${id}/recommendations`, {
            language: 'en-US',
            page: pageNum
        })

        res.status(200).json(recommendationsData)
    } catch (err) {
        console.error('Error fetching movie recommendations:', err.message)
        res.status(500).json({ error: 'Failed to fetch movie recommendations' })
    }
}

/**
 * Get movie genres list
 * GET /api/movies/genres
 */
export const getMovieGenres = async (req, res) => {
    try {
        const genresData = await tmdbRequest('/genre/movie/list', {
            language: 'en-US'
        })

        res.status(200).json(genresData)
    } catch (err) {
        console.error('Error fetching movie genres:', err.message)
        res.status(500).json({ error: 'Failed to fetch movie genres' })
    }
}

/**
 * Discover movies with filters
 * GET /api/movies/discover?with_genres=28&sort_by=popularity.desc&page=1
 */
export const discoverMovies = async (req, res) => {
    try {
        const { 
            with_genres, 
            sort_by, 
            page, 
            year, 
            with_cast,
            with_crew,
            vote_average_gte,
            vote_average_lte 
        } = req.query

        const pageNum = page ? parseInt(page, 10) : 1
        if (isNaN(pageNum) || pageNum < 1) {
            return res.status(400).json({
                error: 'Page must be a positive integer'
            })
        }

        const params = {
            language: 'en-US',
            page: pageNum,
            sort_by: sort_by || 'popularity.desc'
        }

        if (with_genres) params.with_genres = with_genres
        if (year) params.year = year
        if (with_cast) params.with_cast = with_cast
        if (with_crew) params.with_crew = with_crew
        if (vote_average_gte) params['vote_average.gte'] = vote_average_gte
        if (vote_average_lte) params['vote_average.lte'] = vote_average_lte

        const moviesData = await tmdbRequest('/discover/movie', params)

        res.status(200).json(moviesData)
    } catch (err) {
        console.error('Error discovering movies:', err.message)
        res.status(500).json({ error: 'Failed to discover movies' })
    }
}
