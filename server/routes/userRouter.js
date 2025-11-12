import { Router } from 'express'
import { createUser, userLogin, getUserById, updateUser } from '../controllers/userController.js'
import { auth } from '../helpers/auth.js'

const userRouter = Router()

// Register a new user
userRouter.post('/users/createUser', createUser)

// User login
userRouter.post('/users/login', userLogin)

// Get user information by ID
userRouter.get('/users/:id', auth, getUserById)

// Update user information
userRouter.put('/users/updateUser/:id', auth, updateUser)

export default userRouter