import db from "../helpers/db.js";

// Create a new group
// SQL: INSERT INTO groups (...) | params: ownerId, name, description
export async function createGroup(ownerId, name, description) {
    const result = await db.query(
        `INSERT INTO groups (owner_id, name, description, is_visible)
         VALUES ($1, $2, $3, true)
         RETURNING *`,
        [ownerId, name, description]
    );
    return result.rows[0];
}

export async function isUserInGroup(userId, groupId) {
    const result = await db.query(
        `
        SELECT 1 
        FROM group_members
        WHERE user_id = $1 AND group_id = $2
        LIMIT 1
        `,
        [userId, groupId]
    );
    return result.rowCount > 0;
}

// Get a single group by ID
// SQL: SELECT * FROM groups WHERE id=$1 | params: groupId
export async function getGroupById(groupId) {
    const result = await db.query(`
        SELECT 
            g.*,
            u.username AS owner_name
        FROM groups g
        LEFT JOIN users u ON g.owner_id = u.id
        WHERE g.id = $1
    `, [groupId]);
    return result.rows[0];
}

// Get groups the user is a member/owner of
export async function getGroupsForUser(userId) {
    const result = await db.query(`
        SELECT 
            g.*,
            u.username AS owner_name
        FROM group_members gm
        JOIN groups g ON gm.group_id = g.id
        LEFT JOIN users u ON g.owner_id = u.id
        WHERE gm.user_id = $1
    `, [userId]
    );
    return result.rows;
}

// Get all visible groups
// SQL: SELECT * FROM groups WHERE is_visible=true | no params
export async function getGroups() {
    const result = await db.query(`
        SELECT 
            g.*,
            u.username AS owner_name
        FROM groups g
        LEFT JOIN users u ON g.owner_id = u.id
        ORDER BY g.created_at DESC
    `);
    return result.rows;
}

// Update group fields
// SQL: UPDATE groups SET... WHERE id=$4 | params: groupId, name, description, isVisible
export async function updateGroup(groupId, name, description, isVisible) {
    const result = await db.query(
        `UPDATE groups
         SET name = $1, description = $2, is_visible = $3
         WHERE id = $4
         RETURNING *`,
        [name, description, isVisible, groupId]
    );
    return result.rows[0];
}

// Delete a group by ID
// SQL: DELETE FROM groups WHERE id=$1 | params: groupId
export async function deleteGroup(groupId) {
    await db.query(
        `DELETE FROM groups WHERE id = $1`,
        [groupId]
    );
}

// Add member to group
// SQL: INSERT INTO group_members (...) | params: groupId, userId, role
export async function addMember(groupId, userId, role = "member") {
    const result = await db.query(
        `INSERT INTO group_members (group_id, user_id, role)
         VALUES ($1, $2, $3)
         ON CONFLICT (group_id, user_id) DO NOTHING
         RETURNING *`,
        [groupId, userId, role]
    );
    return result.rows[0];
}

// Create a join request
// SQL: INSERT INTO group_join_requests | params: groupId, userId
export async function createJoinRequest(groupId, userId) {
    try {
        const result = await db.query(
            `INSERT INTO group_join_requests (group_id, user_id)
             VALUES ($1, $2)
             ON CONFLICT (group_id, user_id) 
             WHERE status = 'pending'
             DO NOTHING
             RETURNING *`,
            [groupId, userId]
        );
        if (result.rows.length === 0) {
            return { error: "PENDING_EXISTS" }; // user already sent request
        }
        return result.rows[0];
    } catch (err) {
        throw err;
    }
}

// Get all pending join requests for group
// SQL: SELECT * FROM group_join_requests WHERE group_id=$1 AND status='pending' | params: groupId
export async function getJoinRequests(groupId) {
    const result = await db.query(
        `SELECT * FROM group_join_requests
         WHERE group_id = $1 AND status = 'pending'`,
        [groupId]
    );
    return result.rows;
}

// Accept join request
// SQL: UPDATE join request + INSERT into group_members
export async function acceptJoinRequest(requestId) {
    const result = await db.query(
        `UPDATE group_join_requests
         SET status = 'accepted'
         WHERE id = $1
         RETURNING group_id, user_id`,
        [requestId]
    );

    const reqData = result.rows[0];
    if (!reqData) return null;

    await db.query(
        `INSERT INTO group_members (group_id, user_id, role)
         VALUES ($1, $2, 'member')
         ON CONFLICT (group_id, user_id) DO NOTHING`,
        [reqData.group_id, reqData.user_id]
    );

    return reqData;
}

// Reject join request
// SQL: UPDATE join request → rejected
export async function rejectJoinRequest(requestId) {
    const result = await db.query(
        `UPDATE group_join_requests
         SET status = 'rejected'
         WHERE id = $1
         RETURNING *`,
        [requestId]
    );
    return result.rows[0];
}