// Rate limiting to prevent brute force attacks
import rateLimit from 'express-rate-limit'

// Strict limiter for login attempts
export const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 15, // 15 login attempts per window
    message: { 
        error: 'Too many login attempts from this IP, please try again after 15 minutes' 
    },
    standardHeaders: true, // Return rate limit info in headers
    legacyHeaders: false,
    skipSuccessfulRequests: false, // Count successful requests too
})

// Limiter for registration
export const registerLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 15, // 15 registrations per hour per IP
    message: { 
        error: 'Too many accounts created from this IP, please try again after an hour' 
    },
    standardHeaders: true,
    legacyHeaders: false,
})

// General API rate limiter
export const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 500, // 500 requests per window
    message: { 
        error: 'Too many requests from this IP, please try again later' 
    },
    standardHeaders: true,
    legacyHeaders: false,
})

// Stricter limiter for sensitive operations (password changes, deletions)
export const sensitiveOperationLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 15, // 15 attempts per hour
    message: { 
        error: 'Too many attempts for this operation, please try again later' 
    },
    standardHeaders: true,
    legacyHeaders: false,
})
