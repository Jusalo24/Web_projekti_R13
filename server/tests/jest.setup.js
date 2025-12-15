import dotenv from "dotenv"
import pg from "pg"

// Load env for tests first
dotenv.config({ path: ".env.test" })
dotenv.config({ path: ".env" })

process.env.NODE_ENV = "test"

// JWT_SECRET often needed in auth tests
if (!process.env.JWT_SECRET) process.env.JWT_SECRET = "test_secret"

const { Pool } = pg

// If .env uses docker-compose hostname "db", it won't resolve on host machine.
// In docker network it works; on host it doesn't. Fix for local jest runs:
if (process.env.POSTGRES_HOST === "db") {
  process.env.POSTGRES_HOST = "127.0.0.1"
}

const pool = new Pool({
  host: process.env.POSTGRES_HOST,
  port: process.env.POSTGRES_PORT ? Number(process.env.POSTGRES_PORT) : 5432,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
})

async function truncateAllTables() {
  const { rows } = await pool.query(`
    SELECT tablename
    FROM pg_tables
    WHERE schemaname = 'public'
  `)

  const tables = rows
    .map((r) => r.tablename)
    .filter((t) => !["migrations", "knex_migrations", "sequelize_meta"].includes(t))

  if (!tables.length) return

  const sql =
    `TRUNCATE TABLE ${tables.map((t) => `"public"."${t}"`).join(", ")} ` +
    "RESTART IDENTITY CASCADE;"
  await pool.query(sql)
}

let dbReady = false

beforeAll(async () => {
  try {
    await pool.query("SELECT 1;")
    dbReady = true
  } catch (err) {
    dbReady = false
    // Don't crash the whole test run just because DB isn't reachable.
    // This keeps non-DB tests running and makes the failure reason obvious.
    // eslint-disable-next-line no-console
    console.warn(
      `[jest.setup] DB not reachable (host=${process.env.POSTGRES_HOST}). ` +
        `If you run postgres in Docker, either run tests in that container/network ` +
        `or set POSTGRES_HOST=127.0.0.1 in .env.test.`
    )
  }
})

beforeEach(async () => {
  if (!dbReady) return
  await truncateAllTables()
})

afterAll(async () => {
  try {
    await pool.end()
  } catch (_) {}
})
