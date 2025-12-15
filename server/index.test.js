import express from "express"
import cors from "cors"

import userRouter from "./routes/userRouter.js"
import reviewRouter from "./routes/reviewRouter.js"
import groupRouter from "./routes/groupRouter.js"
import favoriteListRouter from "./routes/favoriteListRouter.js"
import movieRouter from "./routes/movieRouter.js"
import tvRouter from "./routes/tvRouter.js"
import searchRouter from "./routes/searchRouter.js"
import genreRouter from "./routes/genreRouter.js"

const app = express()

app.use(cors())
app.use(express.json())

app.use("/api", userRouter)
app.use("/api", reviewRouter)
app.use("/api", groupRouter)
app.use("/api", favoriteListRouter)
app.use("/api", movieRouter)
app.use("/api", tvRouter)
app.use("/api", searchRouter)
app.use("/api", genreRouter)

app.get("/health", (req, res) => res.json({ ok: true }))

export default app
