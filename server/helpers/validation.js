// Input validation and sanitization helpers
import validator from 'validator'

// Sanitize string input to prevent XSS
export const sanitizeString = (input) => {
    if (typeof input !== 'string') return input
    
    return validator.trim(input)
        .replace(/[<>]/g, '') // Remove potential HTML tags
        .substring(0, 500) // Limit length to prevent DOS
}

// Validate email format
export const validateEmail = (email) => {
    if (!email || typeof email !== 'string') {
        return { valid: false, message: 'Email is required' }
    }
    
    if (!validator.isEmail(email)) {
        return { valid: false, message: 'Invalid email format' }
    }
    
    if (email.length > 255) {
        return { valid: false, message: 'Email too long' }
    }
    
    return { valid: true }
}

// Validate username
export const validateUsername = (username) => {
    if (!username || typeof username !== 'string') {
        return { valid: false, message: 'Username is required' }
    }
    
    if (username.length < 3) {
        return { valid: false, message: 'Username must be at least 3 characters' }
    }
    
    if (username.length > 30) {
        return { valid: false, message: 'Username must be less than 30 characters' }
    }
    
    // Allow alphanumeric and underscores only
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
        return { valid: false, message: 'Username can only contain letters, numbers, and underscores' }
    }
    
    return { valid: true }
}

// Strong password validation
export const validatePassword = (password) => {
    if (!password || typeof password !== 'string') {
        return { valid: false, message: 'Password is required' }
    }
    
    if (password.length < 8) {
        return { valid: false, message: 'Password must be at least 8 characters long' }
    }
    
    if (password.length > 128) {
        return { valid: false, message: 'Password is too long' }
    }
    
    if (!/[A-Z]/.test(password)) {
        return { valid: false, message: 'Password must contain at least one uppercase letter' }
    }
    
    if (!/[a-z]/.test(password)) {
        return { valid: false, message: 'Password must contain at least one lowercase letter' }
    }
    
    if (!/[0-9]/.test(password)) {
        return { valid: false, message: 'Password must contain at least one number' }
    }
    
    // Check for common weak passwords
    const commonPasswords = ['Password123!', 'Welcome123!', 'Admin123!']
    if (commonPasswords.includes(password)) {
        return { valid: false, message: 'This password is too common, please choose a different one' }
    }
    
    return { valid: true }
}

// Validate numeric ID
export const validateId = (id) => {
    const numId = parseInt(id, 10)
    
    if (isNaN(numId) || numId < 1) {
        return { valid: false, message: 'Invalid ID' }
    }
    
    return { valid: true, id: numId }
}

// Validate pagination parameters
export const validatePagination = (page, limit) => {
    const pageNum = parseInt(page, 10) || 1
    const limitNum = parseInt(limit, 10) || 10
    
    if (pageNum < 1) {
        return { valid: false, message: 'Page must be greater than 0' }
    }
    
    if (limitNum < 1 || limitNum > 100) {
        return { valid: false, message: 'Limit must be between 1 and 100' }
    }
    
    return { 
        valid: true, 
        page: pageNum, 
        limit: limitNum 
    }
}
