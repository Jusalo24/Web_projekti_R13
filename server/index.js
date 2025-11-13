import express from 'express'
import cors from 'cors'
import movieRouter from './routes/movieRouter.js'
import userRouter from './routes/userRouter.js'

const app = express()
app.use(cors())
app.use(express.json())

app.use('/api', movieRouter)
app.use('/api', userRouter)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => console.log(`Server running on port http://localhost:${PORT}/`))