import pool from '../helpers/db.js'

export const createUser = async (email, username, passwordHash) => {
    const result = await pool.query(
        `INSERT INTO users (email, username, password_hash)
         VALUES ($1, $2, $3)
         RETURNING id, email, username`,
        [email, username, passwordHash]
    )
    return result.rows[0]
}

export const getUserByEmail = async (email) => {
    const result = await pool.query(
        'SELECT * FROM users WHERE LOWER(email) = LOWER($1)',
        [email]
    )
    return result.rows[0]
}

export const getUserById = async (id) => {
    const result = await pool.query(
        'SELECT id, email, username, password_hash FROM users WHERE id = $1',
        [id]
    )
    return result.rows[0]
}

export const updateUser = async (id, fields) => {
    const keys = Object.keys(fields)
    if (keys.length === 0) return null

    const setClause = keys.map((key, i) => `${key} = $${i + 2}`).join(', ')
    const values = Object.values(fields)

    const result = await pool.query(
        `UPDATE users SET ${setClause} WHERE id = $1 RETURNING id, email, username`,
        [id, ...values]
    )
    return result.rows[0]
}

export const updateUserPassword = async (id, passwordHash) => {
  await pool.query(
    `UPDATE users SET password_hash = $1 WHERE id = $2`,
    [passwordHash, id]
  )
}
