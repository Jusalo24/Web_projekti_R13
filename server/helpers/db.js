import { Pool } from 'pg'
import dotenv from 'dotenv'

const environment = process.env.NODE_ENV || 'development'

dotenv.config()

const pool = new Pool({
    host: process.env.POSTGRES_HOST,
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DB,
    port: process.env.POSTGRES_PORT
})

export default pool
