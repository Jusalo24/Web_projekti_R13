import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { createUser, getUserByEmail, getUserById, getUserByIdWithPassword_hash, updateUser, updateUserPassword, deleteUserById } from '../models/userModel.js'
import { validatePassword, validateEmail, validateUsername } from '../helpers/validation.js'

export const registerUser = async (email, username, password) => {
    // Validate email
    const emailValidation = validateEmail(email)
    if (!emailValidation.valid) {
        throw new Error(emailValidation.message)
    }
    
    // Validate username
    const usernameValidation = validateUsername(username)
    if (!usernameValidation.valid) {
        throw new Error(usernameValidation.message)
    }
    
    // Validate password
    const passwordValidation = validatePassword(password)
    if (!passwordValidation.valid) {
        throw new Error(passwordValidation.message)
    }
    
    // Check if email already exists
    const existing = await getUserByEmail(email.toLowerCase())
    if (existing) {
        throw new Error('Email already in use')
    }

    // Hash password with strong salt rounds
    const salt = await bcrypt.genSalt(12) // Increased from 10 to 12 for better security
    const passwordHash = await bcrypt.hash(password, salt)

    // Create user with normalized email
    const newUser = await createUser(email.toLowerCase(), username, passwordHash)
    return newUser
}

export const loginUser = async (email, password) => {
    try {
        // Normalize email
        const normalizedEmail = email.toLowerCase()
        
        // Get user
        const user = await getUserByEmail(normalizedEmail)
        
        // Generic error message - don't reveal if user exists or not
        if (!user) {
            // Still hash the password to prevent timing attacks
            await bcrypt.hash(password, 12)
            throw new Error('Invalid credentials')
        }

        // Verify password
        const isMatch = await bcrypt.compare(password, user.password_hash)
        if (!isMatch) {
            throw new Error('Invalid credentials')
        }

        // Generate JWT token with proper claims
        const token = jwt.sign(
            { 
                id: user.id, 
                email: user.email, 
                username: user.username,
                iat: Math.floor(Date.now() / 1000) // Issued at timestamp
            },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        )

        return {
            user: { 
                id: user.id, 
                email: user.email, 
                username: user.username 
            },
            token
        }
    } catch (err) {
        // Always return generic error message
        throw new Error('Invalid credentials')
    }
}

export const getUserProfile = async (id) => {
    const user = await getUserById(id)
    if (!user) throw new Error('User not found')
    return user
}

export const updateUserProfile = async (id, updates) => {
    // Validate email if being updated
    if (updates.email) {
        const emailValidation = validateEmail(updates.email)
        if (!emailValidation.valid) {
            throw new Error(emailValidation.message)
        }
        updates.email = updates.email.toLowerCase()
    }
    
    // Validate username if being updated
    if (updates.username) {
        const usernameValidation = validateUsername(updates.username)
        if (!usernameValidation.valid) {
            throw new Error(usernameValidation.message)
        }
    }
    
    const updated = await updateUser(id, updates)
    if (!updated) throw new Error('Failed to update user')
    return updated
}





export const changeUserPassword = async (userId, oldPassword, newPassword) => {
    // Get user with password hash
    const user = await getUserByIdWithPassword_hash(userId)

    if (!user) throw new Error("User not found")

    // Verify old password
    const isMatch = await bcrypt.compare(oldPassword, user.password_hash)
    if (!isMatch) throw new Error("Current password is incorrect")

    // Validate new password strength
    const passwordValidation = validatePassword(newPassword)
    if (!passwordValidation.valid) {
        throw new Error(passwordValidation.message)
    }
    
    // Prevent reusing the same password
    const isSamePassword = await bcrypt.compare(newPassword, user.password_hash)
    if (isSamePassword) {
        throw new Error("New password must be different from current password")
    }

    // Hash new password with strong salt
    const salt = await bcrypt.genSalt(12)
    const passwordHash = await bcrypt.hash(newPassword, salt)

    // Update password in database
    await updateUserPassword(userId, passwordHash)

    return true
}


export const deleteUserFromDb = async (id) => {
    const deleted = await deleteUserById(id)
    if (!deleted) throw new Error("User not found or already deleted")
    return true
}