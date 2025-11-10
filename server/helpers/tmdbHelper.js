import axios from "axios"

const TMDB_BASE = 'https://api.themoviedb.org/3'

const tmdbRequest = async (endpoint, params = {}) => {
    try {
        const response = await axios.get(`${TMDB_BASE}${endpoint}`, {
            params: {
                api_key: process.env.TMDB_API_KEY,
                ...params
            }
        })
        return response.data;
    } catch (err) {
        console.error('TMDB API Error:', err.message)
        throw err
    }
}

export default tmdbRequest
