import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import movieRouter from './routes/movieRouter.js'

dotenv.config()

const app = express()
app.use(cors())
app.use(express.json())

app.use('/api', movieRouter)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => console.log(`Server running on port http://localhost:${PORT}/`))