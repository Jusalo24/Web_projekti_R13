import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import helmet from 'helmet'

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

// Import rate limiter
import { apiLimiter } from './helpers/rateLimiter.js'

// Load environment variables FIRST
dotenv.config()

// Validate required environment variables
if (process.env.NODE_ENV !== "test") {
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
    console.error("ERROR: JWT_SECRET must be at least 32 characters long")
    process.exit(1)
  }
  if (!process.env.TMDB_API_KEY) {
    console.error("ERROR: TMDB_API_KEY missing")
    process.exit(1)
  }
  
  // Validate CLIENT_URL for share link functionality
  if (!process.env.CLIENT_URL) {
    console.error("ERROR: CLIENT_URL is required for share link functionality")
    console.error("Set CLIENT_URL in your .env file:")
    console.error("  Development: CLIENT_URL=http://localhost:5173")
    console.error("  Production:  CLIENT_URL=https://webprojektir13-client-production.up.railway.app")
    process.exit(1)
  }
  
  // Validate CLIENT_URL format
  try {
    new URL(process.env.CLIENT_URL);
  } catch (err) {
    console.error("ERROR: CLIENT_URL must be a valid URL")
    console.error(`Current value: ${process.env.CLIENT_URL}`)
    process.exit(1)
  }
}

// Create Express app
const app = express()
const PORT = process.env.PORT || 3001

// Security middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", 'data:', 'https:'],
        },
    },
    hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true
    }
}))

// HTTPS redirect in production
if (process.env.NODE_ENV === 'production') {
    app.set('trust proxy', 1)
    app.use((req, res, next) => {
        if (req.header('x-forwarded-proto') !== 'https') {
            res.redirect(`https://${req.header('host')}${req.url}`)
        } else {
            next()
        }
    })
}

// Define allowed origins for CORS
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    'http://localhost:5174',
    process.env.CLIENT_URL,
    /\.railway\.app$/,
    /\.up\.railway\.app$/
].filter(Boolean)

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
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Request logging middleware
app.use((req, res, next) => {
    const timestamp = new Date().toISOString()
    console.log(`${timestamp} - ${req.method} ${req.path} - IP: ${req.ip}`)
    next()
})

// Health check
app.use('/health', healthRouter)

// Apply general API rate limiter to all routes
app.use('/api', apiLimiter)

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
        method: req.method
    })
})

// Global error handler
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err)
    
    // Don't leak error details in production
    const message = process.env.NODE_ENV === 'development' 
        ? err.message 
        : 'Something went wrong'
    
    res.status(err.status || 500).json({
        error: 'Internal server error',
        message
    })
})

if (process.env.NODE_ENV !== "test") {
    // Start server
    app.listen(PORT, () => {
        console.log(`🚀 Server running on port ${PORT}`)
        console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`)
        console.log(`🎬 TMDB API: ${process.env.TMDB_API_KEY ? 'Configured ✓' : 'Missing ✗'}`)
        console.log(`🗄️  Database: ${process.env.POSTGRES_HOST}:${process.env.POSTGRES_PORT}/${process.env.POSTGRES_DB}`)
        console.log(`🌐 Client URL: ${process.env.CLIENT_URL}`)
        console.log(`🔗 Health check: http://localhost:${PORT}/health`)
    })
}

export default app
