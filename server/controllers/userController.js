import { registerUser, loginUser, getUserProfile, updateUserProfile, changeUserPassword, deleteUserFromDb } from '../services/userService.js'
import { sanitizeString } from '../helpers/validation.js'
import jwt from 'jsonwebtoken'



export const createUser = async (req, res) => {
    try {
        let { email, username, password } = req.body

        // Validate required fields
        if (!email || !username || !password) {
            return res.status(400).json({ 
                error: 'Email, username, and password are required' 
            })
        }

        // Sanitize inputs
        email = sanitizeString(email)
        username = sanitizeString(username)

        // Register user
        const newUser = await registerUser(email, username, password)
        
        res.status(201).json({
            message: 'User registered successfully',
            user: newUser
        })
    } catch (err) {
        console.error('Registration error:', err.message)
        res.status(400).json({ error: err.message })
    }
}

export const userLogin = async (req, res) => {
    try {
        let { email, password } = req.body

        // Validate required fields
        if (!email || !password) {
            return res.status(400).json({ 
                error: 'Email and password are required' 
            })
        }

        // Sanitize email
        email = sanitizeString(email)

        // Attempt login
        const data = await loginUser(email, password)

        // Set refresh token as HttpOnly cookie
        const cookieOptions = {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        }

        res.cookie('refreshToken', data.refreshToken, cookieOptions)

        // Return access token and user info (access token is kept in memory on client)
        res.status(200).json({
            user: data.user,
            accessToken: data.accessToken
        })
    } catch (err) {
        console.error('Login error:', err.message)
        // Use 401 for authentication failures
        res.status(401).json({ error: err.message })
    }
}

export const refreshToken = async (req, res) => {
    try {
        const refreshToken = req.cookies?.refreshToken

        if (!refreshToken) return res.status(401).json({ error: 'No refresh token' })

        // Verify refresh token
        jwt.verify(refreshToken, process.env.JWT_SECRET, (err, decoded) => {
            if (err) return res.status(401).json({ error: 'Invalid refresh token' })

            // Issue new access token
            const accessToken = jwt.sign(
                {
                    id: decoded.id,
                    email: decoded.email,
                    username: decoded.username,
                    iat: Math.floor(Date.now() / 1000)
                },
                process.env.JWT_SECRET,
                { expiresIn: '15m' }
            )

            res.status(200).json({
                accessToken,
                user: { id: decoded.id, email: decoded.email, username: decoded.username }
            })
        })
    } catch (err) {
        console.error('Refresh token error:', err.message)
        res.status(401).json({ error: 'Could not refresh token' })
    }
}

export const getUserById = async (req, res) => {
    try {
        const { id } = req.params

        // Validate ID
        if (!id) {
            return res.status(400).json({ error: 'User ID is required' })
        }

        // Only allow users to view their own profile
        // Handle both UUID and integer IDs
        if (req.user.id.toString() !== id.toString()) {
            return res.status(403).json({ error: 'Access denied' })
        }

        const user = await getUserProfile(id)
        res.status(200).json(user)
    } catch (err) {
        console.error('Get user error:', err.message)
        res.status(404).json({ error: err.message })
    }
}

export const updateUser = async (req, res) => {
    try {
        const { id } = req.params
        let updates = req.body

        // Validate ID
        if (!id) {
            return res.status(400).json({ error: 'User ID is required' })
        }

        // Only allow users to update their own profile
        // Handle both UUID and integer IDs
        if (req.user.id.toString() !== id.toString()) {
            return res.status(403).json({ error: 'Access denied' })
        }

        // Validate updates exist
        if (Object.keys(updates).length === 0) {
            return res.status(400).json({ error: 'No fields to update' })
        }

        // Sanitize string fields
        if (updates.email) updates.email = sanitizeString(updates.email)
        if (updates.username) updates.username = sanitizeString(updates.username)

        // Prevent updating password through this endpoint
        if (updates.password || updates.password_hash) {
            return res.status(400).json({ 
                error: 'Use the /password endpoint to change password' 
            })
        }

        const updated = await updateUserProfile(id, updates)
        res.status(200).json({
            message: 'User updated successfully',
            user: updated
        })
    } catch (err) {
        console.error('Update user error:', err.message)
        res.status(400).json({ error: err.message })
    }
}



export const updatePassword = async (req, res) => {
    try {
        const userId = req.params.id
        const { oldPassword, newPassword } = req.body

        // Validate required fields
        if (!oldPassword || !newPassword) {
            return res.status(400).json({ 
                error: "Both current password and new password are required" 
            })
        }

        // Only allow users to change their own password
        // Handle both UUID and integer IDs
        if (req.user.id.toString() !== userId.toString()) {
            return res.status(403).json({ error: 'Access denied' })
        }

        await changeUserPassword(userId, oldPassword, newPassword)

        res.status(200).json({ 
            message: "Password updated successfully" 
        })
    } catch (err) {
        console.error('Password update error:', err.message)
        res.status(400).json({ error: err.message })
    }
}

export const deleteUser = async (req, res) => {
    try {
        const userId = req.params.id

        // Only allow users to delete their own account
        // Handle both UUID and integer IDs
        if (req.user.id.toString() !== userId.toString()) {
            return res.status(403).json({ 
                error: "You can only delete your own account" 
            })
        }

        await deleteUserFromDb(userId)

        res.status(200).json({ 
            message: "Account deleted successfully" 
        })
    } catch (err) {
        console.error('Delete user error:', err.message)
        res.status(400).json({ error: err.message })
    }
}
