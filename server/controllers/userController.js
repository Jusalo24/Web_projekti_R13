import { registerUser, loginUser, getUserProfile, updateUserProfile, changeUserPassword, deleteUserFromDb } from '../services/userService.js'



export const createUser = async (req, res) => {
    try {
        const { email, username, password } = req.body

        // Validate required fields
        if (!email || !username || !password) {
            return res.status(400).json({ 
                error: 'Email, username, and password are required' 
            })
        }

        const newUser = await registerUser(email, username, password)
        res.status(201).json(newUser)
    } catch (err) {
        // Return proper error object
        res.status(400).json({ error: err.message })
    }
}

export const userLogin = async (req, res) => {
    try {
        const { email, password } = req.body

        // Validate required fields
        if (!email || !password) {
            return res.status(400).json({ 
                error: 'Email and password are required' 
            })
        }

        const data = await loginUser(email, password)
        res.status(200).json(data)
    } catch (err) {
        // Return proper error object with 401 for authentication failures
        res.status(401).json({ error: err.message })
    }
}

export const getUserById = async (req, res) => {
    try {
        const { id } = req.params

        if (!id) {
            return res.status(400).json({ error: 'User ID is required' })
        }

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

        if (!id) {
            return res.status(400).json({ error: 'User ID is required' })
        }

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({ error: 'No fields to update' })
        }

        const updated = await updateUserProfile(id, updates)
        res.status(200).json(updated)
    } catch (err) {
        res.status(400).json({ error: err.message })
    }
}



export const updatePassword = async (req, res) => {
  try {
    const userId = req.params.id
    const { oldPassword, newPassword } = req.body
    console.log("Received password update request for user ID:", userId);
    console.log("Old Password:", oldPassword, "New Password:", newPassword);

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ error: "Both old and new password are required" })
    }

    const result = await changeUserPassword(userId, oldPassword, newPassword)

    res.status(200).json({ message: "Password updated successfully" })
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
}

export const deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;

    // Vain oma tili voidaan poistaa
    if (req.user.id !== userId) {
      return res.status(403).json({ error: "You can only delete your own account" });
    }

    await deleteUserFromDb(userId);

    res.status(200).json({ message: "Account deleted" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
