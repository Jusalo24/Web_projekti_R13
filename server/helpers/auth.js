import jwt from 'jsonwebtoken'

const { verify } = jwt

const auth = (req, res, next) => {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'No token provided' })
    }
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: `Failed to authenticate token: ${token}` })
        }
        next()
    })
}

export { auth }