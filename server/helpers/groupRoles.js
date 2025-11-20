import db from "../helpers/db.js";

// Check if user is owner in group
// middleware: requires params: { id = groupId }
export async function requireOwner(req, res, next) {
    try {
        const userId = req.user.id;
        const groupId = req.params.id;

        const result = await db.query(
            `SELECT role FROM group_members WHERE group_id = $1 AND user_id = $2`,
            [groupId, userId]
        );

        const member = result.rows[0];

        if (!member || (member.role !== "owner")) {
            return res.status(403).json({ error: "Forbidden: Admin/Owner only" });
        }

        next();
    } catch (err) {
        res.status(500).json({ error: "Role check failed" });
    }
}

// Allow owner, admin OR member
// middleware: params: { id = groupId }
export async function requireMemberOrOwner(req, res, next) {
    try {
        const userId = req.user.id;
        const groupId = req.params.id;

        const result = await db.query(
            `SELECT role FROM group_members 
             WHERE group_id = $1 AND user_id = $2`,
            [groupId, userId]
        );

        const member = result.rows[0];

        // All members are allowed (owner, member)
        if (member) {
            return next();
        }

        return res.status(403).json({ error: `Forbidden: Members only ${userId}` });
    } catch (err) {
        res.status(500).json({ error: "Role check failed" });
    }
}