import db from "../helpers/db.js";

export async function createGroup(ownerId, name, description) {
    const result = await db.query(
        `INSERT INTO groups (owner_id, name, description, is_visible)
     VALUES ($1, $2, $3, true)
     RETURNING *`,
        [ownerId, name, description]
    );
    return result.rows[0];
}

export async function getGroupById(groupId) {
    const result = await db.query(
        `SELECT * FROM groups WHERE id = $1`,
        [groupId]
    );
    return result.rows[0];
}

export async function getGroups() {
    const result = await db.query(`SELECT * FROM groups WHERE is_visible = true`);
    return result.rows;
}

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

export async function deleteGroup(groupId) {
    await db.query(`DELETE FROM groups WHERE id = $1`, [groupId]);
}

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

export async function createJoinRequest(groupId, userId) {
    const result = await db.query(
        `INSERT INTO group_join_requests (group_id, user_id)
     VALUES ($1, $2)
     ON CONFLICT (group_id, user_id) 
     WHERE status = 'pending'
     DO NOTHING
     RETURNING *`,
        [groupId, userId]
    );
    return result.rows[0];
}

export async function getJoinRequests(groupId) {
    const result = await db.query(
        `SELECT * FROM group_join_requests
    WHERE group_id = $1 AND status = 'pending'`,
        [groupId]
    );
    return result.rows;
}