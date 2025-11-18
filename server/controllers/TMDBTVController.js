import tmdbRequest from '../helpers/tmdbHelper.js'

// Valid search types for TV shows
const VALID_TV_SEARCH_TYPES = ['popular', 'top_rated', 'on_the_air', 'airing_today']

/**
 * Get TV show recommendations based on ID
 * GET /api/tv/:id/recommendations?page=1
 */
export const getTVRecommendations = async (req, res) => {
    try {
        const { id } = req.params
        const { page } = req.query

        if (!id) {
            return res.status(400).json({ error: 'TV show ID is required' })
        }

        const pageNum = page ? parseInt(page, 10) : 1
        if (isNaN(pageNum) || pageNum < 1) {
            return res.status(400).json({
                error: 'Page must be a positive integer'
            })
        }

        const recommendationsData = await tmdbRequest(`/tv/${id}/recommendations`, {
            language: 'en-US',
            page: pageNum
        })

        res.status(200).json(recommendationsData)
    } catch (err) {
        console.error('Error fetching TV recommendations:', err.message)
        res.status(500).json({ error: 'Failed to fetch TV recommendations' })
    }
}

/**
 * Get TV show details by ID
 * GET /api/tv/:id
 */
export const getTVById = async (req, res) => {
    try {
        const { id } = req.params

        if (!id) {
            return res.status(400).json({ error: 'TV show ID is required' })
        }

        const tvData = await tmdbRequest(`/tv/${id}`, {
            language: 'en-US'
        })

        res.status(200).json(tvData)
    } catch (err) {
        console.error('Error fetching TV show:', err.message)
        res.status(500).json({ error: 'Failed to fetch TV show data' })
    }
}

/**
 * Get TV shows by category (popular, top_rated, on_the_air, airing_today)
 * GET /api/tv/list/:searchType?page=1
 */
export const getTVByType = async (req, res) => {
    try {
        const { searchType } = req.params
        const { page } = req.query

        if (!VALID_TV_SEARCH_TYPES.includes(searchType)) {
            return res.status(400).json({
                error: `Invalid search type. Valid options are: ${VALID_TV_SEARCH_TYPES.join(', ')}`
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

        const tvData = await tmdbRequest(`/tv/${searchType}`, params)

        res.status(200).json(tvData)
    } catch (err) {
        console.error('Error fetching TV shows:', err.message)
        res.status(500).json({ error: 'Failed to fetch TV shows data' })
    }
}

/**
 * Search TV shows by query
 * GET /api/tv/search?q=breaking+bad&page=1
 */
export const searchTV = async (req, res) => {
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

        const tvData = await tmdbRequest('/search/tv', {
            query: q,
            page: pageNum,
            language: 'en-US'
        })

        res.status(200).json(tvData)
    } catch (err) {
        console.error('Error searching TV shows:', err.message)
        res.status(500).json({ error: 'Failed to search TV shows' })
    }
}

/**
 * Get TV show season details
 * GET /api/tv/:id/season/:season_number
 */
export const getTVSeason = async (req, res) => {
    try {
        const { id, season_number } = req.params

        if (!id || !season_number) {
            return res.status(400).json({ error: 'TV show ID and season number are required' })
        }

        const seasonData = await tmdbRequest(`/tv/${id}/season/${season_number}`, {
            language: 'en-US'
        })

        res.status(200).json(seasonData)
    } catch (err) {
        console.error('Error fetching TV season:', err.message)
        res.status(500).json({ error: 'Failed to fetch TV season data' })
    }
}

/**
 * Get TV show credits (cast and crew)
 * GET /api/tv/:id/credits
 */
export const getTVCredits = async (req, res) => {
    try {
        const { id } = req.params

        if (!id) {
            return res.status(400).json({ error: 'TV show ID is required' })
        }

        const creditsData = await tmdbRequest(`/tv/${id}/credits`, {
            language: 'en-US'
        })

        res.status(200).json(creditsData)
    } catch (err) {
        console.error('Error fetching TV credits:', err.message)
        res.status(500).json({ error: 'Failed to fetch TV credits' })
    }
}

/**
 * Get TV show videos (trailers, teasers)
 * GET /api/tv/:id/videos
 */
export const getTVVideos = async (req, res) => {
    try {
        const { id } = req.params

        if (!id) {
            return res.status(400).json({ error: 'TV show ID is required' })
        }

        const videosData = await tmdbRequest(`/tv/${id}/videos`, {
            language: 'en-US'
        })

        res.status(200).json(videosData)
    } catch (err) {
        console.error('Error fetching TV videos:', err.message)
        res.status(500).json({ error: 'Failed to fetch TV videos' })
    }
}

/**
 * Get similar TV shows
 * GET /api/tv/:id/similar?page=1
 */
export const getSimilarTV = async (req, res) => {
    try {
        const { id } = req.params
        const { page } = req.query

        if (!id) {
            return res.status(400).json({ error: 'TV show ID is required' })
        }

        const pageNum = page ? parseInt(page, 10) : 1
        if (isNaN(pageNum) || pageNum < 1) {
            return res.status(400).json({
                error: 'Page must be a positive integer'
            })
        }

        const similarData = await tmdbRequest(`/tv/${id}/similar`, {
            language: 'en-US',
            page: pageNum
        })

        res.status(200).json(similarData)
    } catch (err) {
        console.error('Error fetching similar TV shows:', err.message)
        res.status(500).json({ error: 'Failed to fetch similar TV shows' })
    }
}

/**
 * Discover TV shows with filters
 * GET /api/tv/discover?with_genres=28&sort_by=popularity.desc&page=1
 */
export const discoverTV = async (req, res) => {
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
        if (year) params.first_air_date_year = year
        if (with_cast) params.with_cast = with_cast
        if (with_crew) params.with_crew = with_crew
        if (vote_average_gte) params['vote_average.gte'] = vote_average_gte
        if (vote_average_lte) params['vote_average.lte'] = vote_average_lte

        // DEBUG: Tulosta parametrit konsoliin
        console.log('Params to TMDB:', params)
        console.log('Full URL will be:', `/discover/tv`)

        const tvData = await tmdbRequest('/discover/tv', params)

        res.status(200).json(tvData)
    } catch (err) {
        console.error('Error discovering tv shows:', err.message)
        res.status(500).json({ error: 'Failed to discover tv shows' })
    }
}
