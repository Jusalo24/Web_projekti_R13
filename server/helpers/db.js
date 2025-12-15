import { Pool } from "pg"
import dotenv from "dotenv"

dotenv.config()

const isTest = process.env.NODE_ENV === "test"

const pool = new Pool({
    host: process.env.POSTGRES_HOST,
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: isTest
        ? process.env.POSTGRES_DB_TEST
        : process.env.POSTGRES_DB,
    port: Number(process.env.POSTGRES_PORT || 5432)
})

export default pool