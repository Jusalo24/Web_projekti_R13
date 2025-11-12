import { registerUser, loginUser, getUserProfile, updateUserProfile } from '../services/userService.js'

export const createUser = async (req, res) => {
    try {
        const { email, username, password } = req.body
        const newUser = await registerUser(email, username, password)
        res.status(201).json(newUser)
    } catch (err) {
        res.status(400).json({ error: err.message })
    }
}

export const userLogin = async (req, res) => {
    try {
        const { email, password } = req.body
        const data = await loginUser(email, password)
        res.status(200).json(data)
    } catch (err) {
        res.status(401).json({ error: err.message })
    }
}

export const getUserById = async (req, res) => {
    try {
        const { id } = req.params
        const user = await getUserProfile(id)
        res.status(200).json(user)
    } catch (err) {
        res.status(404).json({ error: err.message })
    }
}

export const updateUser = async (req, res) => {
    try {
        const { id } = req.params
        const updates = req.body
        const updated = await updateUserProfile(id, updates)
        res.status(200).json(updated)
    } catch (err) {
        res.status(400).json({ error: err.message })
    }
}
