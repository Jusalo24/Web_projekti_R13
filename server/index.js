import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'

// Import routers
import userRouter from './routes/userRouter.js'
import movieRouter from './routes/movieRouter.js'
import tvRouter from './routes/tvRouter.js'
import searchRouter from './routes/searchRouter.js'
import reviewRouter from './routes/reviewRouter.js'
import genreRouter from './routes/genreRouter.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Request logging middleware (optional, helpful for debugging)
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`)
    next()
})

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    })
})

// Mount routers
app.use('/api', userRouter)
app.use('/api', movieRouter)
app.use('/api', tvRouter)
app.use('/api', searchRouter)
app.use('/api', reviewRouter)
app.use('/api', genreRouter)

// 404 handler - Must come after all routes
app.use((req, res) => {
    res.status(404).json({
        error: 'Route not found',
        path: req.originalUrl,
        method: req.method,
        message: 'The requested endpoint does not exist'
    })
})

// Global error handler - Must be last
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err)
    res.status(500).json({
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
    })
})

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`)
    console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`)
    console.log(`🎬 TMDB API: ${process.env.TMDB_API_KEY ? 'Configured ✓' : 'Missing ✗'}`)
    console.log(`🗄️  Database: ${process.env.POSTGRES_HOST}:${process.env.POSTGRES_PORT}/${process.env.POSTGRES_DB}`)
    console.log(`🔗 Health check: http://localhost:${PORT}/health`)
})

export default app