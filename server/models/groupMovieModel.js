import db from "../helpers/db.js";

// Add movie to group
// SQL: INSERT group_movies | params: groupId, movieId, userId, mediaType
export async function addMovie(groupId, movieId, mediaType, userId) {
    const result = await db.query(
        `INSERT INTO group_movies (group_id, movie_external_id, media_type, added_by)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (group_id, movie_external_id, media_type) DO NOTHING
         RETURNING *`,
        [groupId, movieId, mediaType, userId]
    );
    return result.rows[0];
}

// Remove movie from group
// SQL: DELETE FROM group_movies | params: groupId, movieId, mediaType
export async function removeMovie(groupId, movieId, mediaType) {
    await db.query(
        `DELETE FROM group_movies
         WHERE group_id = $1 AND movie_external_id = $2 AND media_type = $3`,
        [groupId, movieId, mediaType]
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