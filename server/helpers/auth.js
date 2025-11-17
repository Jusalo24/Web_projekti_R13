import jwt from 'jsonwebtoken'

const { verify } = jwt

const auth = (req, res, next) => {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]

    // Check if token exists
    if (!token) {
        return res.status(401).json({ error: 'No token provided' })
    }

    // Verify token
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({ error: 'Failed to authenticate token' })
        }
        
        // Attach decoded user info to request for use in controllers
        req.user = decoded
        next()
    })
}

export { auth }