import { Router } from 'express'
import { createUser, userLogin, getUserById, updateUser, updatePassword, deleteUser, refreshToken } from '../controllers/userController.js'
import { auth, blacklistToken } from '../helpers/auth.js'
import { loginLimiter, registerLimiter, sensitiveOperationLimiter } from '../helpers/rateLimiter.js'

const userRouter = Router()

// Register a new user (rate limited)
userRouter.post('/users/register', registerLimiter, createUser)

// User login (rate limited)
userRouter.post('/users/login', loginLimiter, userLogin)

// User logout (blacklist token)
userRouter.post('/users/logout', auth, (req, res) => {
    try {
        // Blacklist access token if present in Authorization header
        const token = req.headers['authorization']?.split(' ')[1]
        if (token) {
            blacklistToken(token)
        }

        // Also blacklist refresh token from cookie and clear it on client
        const refresh = req.cookies?.refreshToken
        if (refresh) {
            blacklistToken(refresh)
        }

        res.clearCookie('refreshToken', { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production' })
        res.json({ message: 'Logged out successfully' })
    } catch (err) {
        console.error('Logout error:', err)
        res.status(500).json({ error: 'Failed to logout' })
    }
})

// Refresh access token using HttpOnly refresh cookie
userRouter.post('/users/refresh', refreshToken)

// Get current logged-in user
userRouter.get('/users/me', auth, (req, res) => {
    res.json({
        id: req.user.id,
        email: req.user.email,
        username: req.user.username
    })
})

// Get user information by ID (protected)
userRouter.get('/users/:id', auth, getUserById)

// Update user information (protected)
userRouter.put('/users/:id', auth, updateUser)

// Update user password (protected + rate limited)
userRouter.put('/users/:id/password', auth, sensitiveOperationLimiter, updatePassword)

// Delete user (protected + rate limited)
userRouter.delete('/users/:id', auth, sensitiveOperationLimiter, deleteUser)

export default userRouter