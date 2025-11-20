import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { createUser, getUserByEmail, getUserById, getUserByIdWithPassword_hash, updateUser, updateUserPassword } from '../models/userModel.js'

export const registerUser = async (email, username, password) => {
    const existing = await getUserByEmail(email)
    if (existing) {
        throw new Error('Email already in use')
    }

    if (!validatePassword(password)) {
        throw new Error("Password must be at least 8 characters long and contain one uppercase letter and one number")
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

export const validatePassword = (password) => {
  if (password.length < 8) return false;
  if (!/[A-Z]/.test(password)) return false;
  if (!/[0-9]/.test(password)) return false;
  return true;
};



export const changeUserPassword = async (userId, oldPassword, newPassword) => {
  const user = await getUserByIdWithPassword_hash(userId)

  if (!user) throw new Error("User not found")

  // Tarkista onko vanha salasana oikein
  const isMatch = await bcrypt.compare(oldPassword, user.password_hash)
  if (!isMatch) throw new Error("Old password is incorrect")

  // Tarkista uuden salasanan vahvuus
  if (!validatePassword(newPassword)) {
    throw new Error("New password must be 8+ chars, 1 uppercase letter, and 1 number")
  }

  // Hashaa uusi salasana
  const salt = await bcrypt.genSalt(10)
  const passwordHash = await bcrypt.hash(newPassword, salt)

  // Päivitä se tietokantaan
  await updateUserPassword(userId, passwordHash)

  return true
}

