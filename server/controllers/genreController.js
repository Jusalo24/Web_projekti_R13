import tmdbRequest from '../helpers/tmdbHelper.js'

/**
 * Get all movie genres
 * GET /api/genres/movie
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
 * Get all TV genres
 * GET /api/genres/tv
 */
export const getTVGenres = async (req, res) => {
    try {
        const genresData = await tmdbRequest('/genre/tv/list', {
            language: 'en-US'
        })

        res.status(200).json(genresData)
    } catch (err) {
        console.error('Error fetching TV genres:', err.message)
        res.status(500).json({ error: 'Failed to fetch TV genres' })
    }
}

/**
 * Discover TV shows with filters
 * GET /api/discover/tv?with_genres=10765&sort_by=popularity.desc&page=1
 */
export const discoverTV = async (req, res) => {
    try {
        const { 
            with_genres, 
            sort_by, 
            page, 
            first_air_date_year,
            vote_average_gte,
            vote_average_lte,
            with_networks
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
        if (first_air_date_year) params.first_air_date_year = first_air_date_year
        if (vote_average_gte) params['vote_average.gte'] = vote_average_gte
        if (vote_average_lte) params['vote_average.lte'] = vote_average_lte
        if (with_networks) params.with_networks = with_networks

        const tvData = await tmdbRequest('/discover/tv', params)

        res.status(200).json(tvData)
    } catch (err) {
        console.error('Error discovering TV shows:', err.message)
        res.status(500).json({ error: 'Failed to discover TV shows' })
    }
}