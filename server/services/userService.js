import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { createUser, getUserByEmail, getUserById, updateUser } from '../models/userModel.js'

export const registerUser = async (email, username, password) => {
    const existing = await getUserByEmail(email)
    if (existing) {
        throw new Error('Email already in use')
    }

    const salt = await bcrypt.genSalt(10)
    const passwordHash = await bcrypt.hash(password, salt)

    const newUser = await createUser(email, username, passwordHash)
    return newUser
}

export const loginUser = async (email, password) => {
    const user = await getUserByEmail(email)
    if (!user) throw new Error('User not found')

    const isMatch = await bcrypt.compare(password, user.password_hash)
    if (!isMatch) throw new Error('Invalid password')

    const token = jwt.sign(
        { id: user.id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
    )

    return {
        user: { id: user.id, email: user.email, username: user.username },
        token
    }
}

export const getUserProfile = async (id) => {
    const user = await getUserById(id)
    if (!user) throw new Error('User not found')
    return user
}

export const updateUserProfile = async (id, updates) => {
    const updated = await updateUser(id, updates)
    if (!updated) throw new Error('Failed to update user')
    return updated
}
