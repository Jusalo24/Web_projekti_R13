import { Router } from 'express'
import { createUser, userLogin, getUserById, updateUser, updatePassword } from '../controllers/userController.js'
import { auth } from '../helpers/auth.js'


const userRouter = Router()

// Register a new user
userRouter.post('/users/register', createUser)

// User login
userRouter.post('/users/login', userLogin)

// Get current logged-in user
userRouter.get('/users/me', auth, (req, res) => {
    res.json({
        id: req.user.id,
        email: req.user.email,
        username: req.user.username
    });
});

// Get user information by ID
userRouter.get('/users/:id', auth, getUserById)

// Update user information
userRouter.put('/users/:id', auth, updateUser)

// Update user password
userRouter.put('/users/:id/password', auth, updatePassword)

export default userRouter