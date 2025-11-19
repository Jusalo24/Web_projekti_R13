import pool from "../helpers/db.js"

// Create a list
export const createFavoriteList = async (userId, title, description = null) => {
  const result = await pool.query(
    `INSERT INTO favorite_lists (user_id, title, description)
     VALUES ($1, $2, $3)
     RETURNING id, user_id, title, description`,
    [userId, title, description]
  )
  return result.rows[0]
}

// Get all lists of a user
export const getFavoriteListsByUser = async (userId) => {
  const result = await pool.query(
    `SELECT id, title, description 
     FROM favorite_lists
     WHERE user_id = $1
     ORDER BY title ASC`,
    [userId]
  )
  return result.rows
}

// Get 1 list
export const getFavoriteListById = async (listId) => {
  const result = await pool.query(
    `SELECT id, user_id, title, description
     FROM favorite_lists 
     WHERE id = $1`,
    [listId]
  )
  return result.rows[0]
}

// Delete list
export const deleteFavoriteList = async (listId) => {
  await pool.query(`DELETE FROM favorite_lists WHERE id = $1`, [listId])
  return true
}
