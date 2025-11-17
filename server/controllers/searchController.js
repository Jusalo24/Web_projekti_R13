import tmdbRequest from '../helpers/tmdbHelper.js'

/**
 * Multi-search endpoint - searches movies, TV shows, and people
 * GET /api/search/multi?q=avatar&page=1
 */
export const multiSearch = async (req, res) => {
    try {
        const { q, page } = req.query

        if (!q || q.trim() === '') {
            return res.status(400).json({ error: 'Query parameter "q" is required and cannot be empty' })
        }

        const pageNum = page ? parseInt(page, 10) : 1
        if (isNaN(pageNum) || pageNum < 1) {
            return res.status(400).json({
                error: 'Page must be a positive integer'
            })
        }

        const searchData = await tmdbRequest('/search/multi', {
            query: q,
            page: pageNum,
            language: 'en-US'
        })

        res.status(200).json(searchData)
    } catch (err) {
        console.error('Error performing multi-search:', err.message)
        res.status(500).json({ error: 'Failed to perform multi-search' })
    }
}

/**
 * Search people (actors, directors, etc.)
 * GET /api/search/person?q=tom+cruise&page=1
 */
export const searchPerson = async (req, res) => {
    try {
        const { q, page } = req.query

        if (!q || q.trim() === '') {
            return res.status(400).json({ error: 'Query parameter "q" is required and cannot be empty' })
        }

        const pageNum = page ? parseInt(page, 10) : 1
        if (isNaN(pageNum) || pageNum < 1) {
            return res.status(400).json({
                error: 'Page must be a positive integer'
            })
        }

        const personData = await tmdbRequest('/search/person', {
            query: q,
            page: pageNum,
            language: 'en-US'
        })

        res.status(200).json(personData)
    } catch (err) {
        console.error('Error searching people:', err.message)
        res.status(500).json({ error: 'Failed to search people' })
    }
}

/**
 * Get person details by ID
 * GET /api/person/:id
 */
export const getPersonById = async (req, res) => {
    try {
        const { id } = req.params

        if (!id) {
            return res.status(400).json({ error: 'Person ID is required' })
        }

        if (isNaN(id)) {
            return res.status(400).json({ error: 'Person ID must be a number' })
        }

        const personData = await tmdbRequest(`/person/${id}`, {
            language: 'en-US'
        })

        res.status(200).json(personData)
    } catch (err) {
        console.error('Error fetching person:', err.message)
        
        if (err.response && err.response.status === 404) {
            return res.status(404).json({ error: 'Person not found' })
        }
        
        res.status(500).json({ error: 'Failed to fetch person data' })
    }
}

/**
 * Get person movie credits
 * GET /api/person/:id/movie_credits
 */
export const getPersonMovieCredits = async (req, res) => {
    try {
        const { id } = req.params

        if (!id) {
            return res.status(400).json({ error: 'Person ID is required' })
        }

        if (isNaN(id)) {
            return res.status(400).json({ error: 'Person ID must be a number' })
        }

        const creditsData = await tmdbRequest(`/person/${id}/movie_credits`, {
            language: 'en-US'
        })

        res.status(200).json(creditsData)
    } catch (err) {
        console.error('Error fetching person movie credits:', err.message)
        
        if (err.response && err.response.status === 404) {
            return res.status(404).json({ error: 'Person not found' })
        }
        
        res.status(500).json({ error: 'Failed to fetch person movie credits' })
    }
}

/**
 * Get person TV credits
 * GET /api/person/:id/tv_credits
 */
export const getPersonTVCredits = async (req, res) => {
    try {
        const { id } = req.params

        if (!id) {
            return res.status(400).json({ error: 'Person ID is required' })
        }

        if (isNaN(id)) {
            return res.status(400).json({ error: 'Person ID must be a number' })
        }

        const creditsData = await tmdbRequest(`/person/${id}/tv_credits`, {
            language: 'en-US'
        })

        res.status(200).json(creditsData)
    } catch (err) {
        console.error('Error fetching person TV credits:', err.message)
        
        if (err.response && err.response.status === 404) {
            return res.status(404).json({ error: 'Person not found' })
        }
        
        res.status(500).json({ error: 'Failed to fetch person TV credits' })
    }
}

/**
 * Get trending items (movies, TV shows, people)
 * GET /api/trending/:media_type/:time_window
 * media_type: all, movie, tv, person
 * time_window: day, week
 */
export const getTrending = async (req, res) => {
    try {
        const { media_type, time_window } = req.params
        const { page } = req.query

        const validMediaTypes = ['all', 'movie', 'tv', 'person']
        const validTimeWindows = ['day', 'week']

        if (!validMediaTypes.includes(media_type)) {
            return res.status(400).json({
                error: `Invalid media type. Valid options are: ${validMediaTypes.join(', ')}`
            })
        }

        if (!validTimeWindows.includes(time_window)) {
            return res.status(400).json({
                error: `Invalid time window. Valid options are: ${validTimeWindows.join(', ')}`
            })
        }

        const pageNum = page ? parseInt(page, 10) : 1
        if (isNaN(pageNum) || pageNum < 1) {
            return res.status(400).json({
                error: 'Page must be a positive integer'
            })
        }

        const trendingData = await tmdbRequest(`/trending/${media_type}/${time_window}`, {
            language: 'en-US',
            page: pageNum
        })

        res.status(200).json(trendingData)
    } catch (err) {
        console.error('Error fetching trending:', err.message)
        res.status(500).json({ error: 'Failed to fetch trending data' })
    }
}
