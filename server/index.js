import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'

// Import routers
import userRouter from './routes/userRouter.js'
import movieRouter from './routes/movieRouter.js'
import tvRouter from './routes/tvRouter.js'
import searchRouter from './routes/searchRouter.js'
import reviewRouter from './routes/reviewRouter.js'
import replyRouter from './routes/replyRouter.js'
import genreRouter from './routes/genreRouter.js'
import groupRouter from './routes/groupRouter.js'
import favoriteListRouter from './routes/favoriteListRouter.js'
import healthRouter from './routes/healthRouter.js'

// Load environment variables FIRST
dotenv.config()

// Create Express app
const app = express()
const PORT = process.env.PORT || 3001

// Define allowed origins for CORS
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:5174',
  process.env.CLIENT_URL,
  /\.railway\.app$/,
  /\.up\.railway\.app$/
]

// Configure CORS middleware
app.use(cors({
  origin: function(origin, callback) {
    if (!origin) return callback(null, true)

    const isAllowed = allowedOrigins.some(allowed => {
      if (allowed instanceof RegExp) return allowed.test(origin)
      return allowed === origin
    })

    if (isAllowed) {
      callback(null, true)
    } else {
      console.log(`CORS blocked origin: ${origin}`)
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))

// Body parsing middleware
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`)
  next()
})

// Health check
app.use('/health', healthRouter)

// Mount routers
app.use('/api', userRouter)
app.use('/api', movieRouter)
app.use('/api', tvRouter)
app.use('/api', searchRouter)
app.use('/api', reviewRouter)
app.use('/api', genreRouter)
app.use('/api', groupRouter)
app.use('/api', favoriteListRouter)
app.use('/api', replyRouter)

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl,
    method: req.method,
    message: 'The requested endpoint does not exist'
  })
})

// Global error handler
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