import pool from "../helpers/db.js"

// Add item to list
export const addFavoriteItem = async (listId, movieId, position = 0) => {
  const result = await pool.query(
    `INSERT INTO favorite_list_items (favorite_list_id, movie_external_id, position)
     VALUES ($1, $2, $3)
     RETURNING id, favorite_list_id, movie_external_id, position`,
    [listId, movieId, position]
  )
  return result.rows[0]
}

// Get items in a list
export const getFavoriteItemsByList = async (listId) => {
  const result = await pool.query(
    `SELECT id, movie_external_id, position 
     FROM favorite_list_items
     WHERE favorite_list_id = $1
     ORDER BY position ASC`,
    [listId]
  )
  return result.rows
}

// Delete item
export const deleteFavoriteItem = async (itemId) => {
  await pool.query(
    `DELETE FROM favorite_list_items WHERE id = $1`,
    [itemId]
  )
  return true
}
