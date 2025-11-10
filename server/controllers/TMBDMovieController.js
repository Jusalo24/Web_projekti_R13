import tmdbRequest from '../helpers/tmdbHelper.js'

// Sallitut search_type vaihtoehdot
const VALID_SEARCH_TYPES = ['popular', 'now_playing', 'top_rated', 'latest', 'upcoming']

// Hae elokuvan tiedot ID:n perusteella
export const getMovieById = async (req, res) => {
    try {
        const { movieId } = req.params

        if (!movieId) {
            return res.status(400).json({ error: 'Movie ID is required' })
        }

        const movieData = await tmdbRequest(`/movie/${movieId}`, {
            language: 'en-US'
        })

        res.status(200).json(movieData)
    } catch (err) {
        console.error('Error fetching movie:', err.message)
        res.status(500).json({ error: 'Failed to fetch movie data' })
    }
}

// Hae elokuvia kategorian perusteella
export const getMoviesByType = async (req, res) => {
    try {
        const { searchType, page } = req.params
        const { region } = req.query

        // Validoi search_type
        if (!VALID_SEARCH_TYPES.includes(searchType)) {
            return res.status(400).json({
                error: `Invalid search type. Valid options are: ${VALID_SEARCH_TYPES.join(', ')}`
            })
        }

        // Validoi page - varmista että se on positiivinen kokonaisluku
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


