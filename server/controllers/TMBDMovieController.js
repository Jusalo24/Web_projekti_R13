import tmdbRequest from '../helpers/tmdbHelper.js'

// Sallitut search_type vaihtoehdot
const VALID_SEARCH_TYPES = ['popular', 'now_playing', 'top_rated', 'latest', 'upcoming']

/**
 * Hae yksittäisen elokuvan tiedot ID:n perusteella
 * GET /api/movies/:id
 */
export const getMovieById = async (req, res) => {
    try {
        const { id } = req.params

        // Tarkista että ID on annettu
        if (!id) {
            return res.status(400).json({ error: 'Movie ID is required' })
        }

        // Hae elokuvan tiedot TMDB API:sta
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
 * Hae elokuvia kategorian perusteella (popular, now_playing, jne.)
 * GET /api/movies/category/:searchType?page=1&region=FI
 */
export const getMoviesByType = async (req, res) => {
    try {
        const { searchType } = req.params
        const { region, page } = req.query

        // Tarkista että searchType on validi
        if (!VALID_SEARCH_TYPES.includes(searchType)) {
            return res.status(400).json({
                error: `Invalid search type. Valid options are: ${VALID_SEARCH_TYPES.join(', ')}`
            })
        }

        // Validoi sivunumero
        const pageNum = page ? parseInt(page, 10) : 1
        if (isNaN(pageNum) || pageNum < 1) {
            return res.status(400).json({
                error: 'Page must be a positive integer'
            })
        }

        // Rakenna API-kutsulle parametrit
        const params = {
            language: 'en-US',
            page: pageNum
        }

        // Lisää region jos annettu
        if (region) params.region = region

        // Hae elokuvat TMDB API:sta
        const moviesData = await tmdbRequest(`/movie/${searchType}`, params)

        res.status(200).json(moviesData)
    } catch (err) {
        console.error('Error fetching movies:', err.message)
        res.status(500).json({ error: 'Failed to fetch movies data' })
    }
}

/**
 * Hae elokuvia hakusanalla
 * GET /api/movies/search?q=avatar&page=1
 */
export const searchMovies = async (req, res) => {
    try {
        const { q, page } = req.query

        // Tarkista että hakusana on annettu
        if (!q) {
            return res.status(400).json({ error: 'Query parameter "q" is required' })
        }

        // Validoi sivunumero
        const pageNum = page ? parseInt(page, 10) : 1
        if (isNaN(pageNum) || pageNum < 1) {
            return res.status(400).json({
                error: 'Page must be a positive integer'
            })
        }

        // Hae elokuvat hakusanalla TMDB API:sta
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