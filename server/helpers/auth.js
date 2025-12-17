import jwt from 'jsonwebtoken'

// Token blacklist (in production, use Redis instead)
const tokenBlacklist = new Set()

export const auth = (req, res, next) => {
    try {
        const authHeader = req.headers['authorization']
        
        if (!authHeader) {
            return res.status(401).json({ error: 'Authentication required' })
        }

        const token = authHeader.split(' ')[1]
        
        if (!token) {
            return res.status(401).json({ error: 'Authentication required' })
        }

        // Check if token is blacklisted (logout functionality)
        if (tokenBlacklist.has(token)) {
            return res.status(401).json({ error: 'Token has been revoked' })
        }

        // Verify token
        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (err) {
                if (err.name === 'TokenExpiredError') {
                    return res.status(401).json({ error: 'Token expired' })
                }
                if (err.name === 'JsonWebTokenError') {
                    return res.status(401).json({ error: 'Invalid token' })
                }
                return res.status(401).json({ error: 'Authentication failed' })
            }
            
                // Attach user info to request
                req.user = decoded
                next()
        })
    } catch (err) {
        console.error('Auth middleware error:', err)
        return res.status(500).json({ error: 'Authentication failed' })
    }
}

// Function to blacklist tokens (for logout)
export const blacklistToken = (token) => {
    tokenBlacklist.add(token)
    
    // Auto-remove token from blacklist after expiry (7 days)
    setTimeout(() => {
        tokenBlacklist.delete(token)
    }, 7 * 24 * 60 * 60 * 1000)
}

// Get blacklist size for monitoring
export const getBlacklistSize = () => tokenBlacklist.size
