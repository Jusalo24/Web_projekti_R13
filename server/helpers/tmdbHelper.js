import axios from "axios"

const TMDB_BASE = 'https://api.themoviedb.org/3'

const tmdbRequest = async (endpoint, params = {}) => {
    try {
        const fullUrl = `${TMDB_BASE}${endpoint}`

        // Check if API key exists
        if (!process.env.TMDB_API_KEY) {
            throw new Error('TMDB API key is not configured')
        }

        // Debug log (remove api_key from logs for security)
        console.log('TMDB Request:', {
            url: fullUrl,
            params: {
                ...params,
                api_key: '***hidden***'
            }
        })

        const response = await axios.get(fullUrl, {
            params: {
                api_key: process.env.TMDB_API_KEY,
                ...params
            }
        })

        return response.data
    } catch (err) {
        // Log detailed error information
        console.error('TMDB API Error:', {
            message: err.message,
            endpoint: endpoint,
            status: err.response?.status,
            statusText: err.response?.statusText,
            data: err.response?.data
        })

        // Preserve the original error for proper handling upstream
        throw err
    }
}

export default tmdbRequest
