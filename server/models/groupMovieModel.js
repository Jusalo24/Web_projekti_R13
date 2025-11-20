import db from "../helpers/db.js";

// Add movie to group
// SQL: INSERT group_movies | params: groupId, movieId, userId
export async function addMovie(groupId, movieId, userId) {
    const result = await db.query(
        `INSERT INTO group_movies (group_id, movie_external_id, added_by)
         VALUES ($1, $2, $3)
         ON CONFLICT (group_id, movie_external_id) DO NOTHING
         RETURNING *`,
        [groupId, movieId, userId]
    );
    return result.rows[0];
}

// Remove movie from group
// SQL: DELETE FROM group_movies | params: groupId, movieId
export async function removeMovie(groupId, movieId) {
    await db.query(
        `DELETE FROM group_movies
         WHERE group_id = $1 AND movie_external_id = $2`,
        [groupId, movieId]
    );
}

// Get movies in group
// SQL: SELECT * FROM group_movies | params: groupId
export async function getGroupMovies(groupId) {
    const result = await db.query(
        `SELECT * FROM group_movies WHERE group_id = $1`,
        [groupId]
    );
    return result.rows;
}