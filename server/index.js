import express from 'express'
import cors from 'cors'
import 'dotenv/config.js'
import movieRouter from './routes/movieRouter.js'

const app = express()
app.use(cors())
app.use(express.json())

app.use('', movieRouter)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => console.log(`Server running on port http://localhost:${PORT}/`))