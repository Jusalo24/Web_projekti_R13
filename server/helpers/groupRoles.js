import pool from './db.js';

/**
 * Middleware: Check if user is the owner of the group
 */
export const requireOwner = async (req, res, next) => {
    try {
        const groupId = req.params.id;
        const userId = req.user.id;

        const result = await pool.query(
            'SELECT owner_id FROM groups WHERE id = $1',
            [groupId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Group not found' });
        }

        const group = result.rows[0];

        if (group.owner_id !== userId) {
            return res.status(403).json({ 
                error: 'Forbidden: Only the group owner can perform this action' 
            });
        }

        next();
    } catch (err) {
        console.error('Error checking group ownership:', err);
        res.status(500).json({ error: 'Failed to verify permissions' });
    }
};

/**
 * Middleware: Check if user is a member or owner of the group
 */
export const requireMemberOrOwner = async (req, res, next) => {
    try {
        const groupId = req.params.id;
        const userId = req.user.id;

        // Check if user is owner
        const ownerResult = await pool.query(
            'SELECT owner_id FROM groups WHERE id = $1',
            [groupId]
        );

        if (ownerResult.rows.length === 0) {
            return res.status(404).json({ error: 'Group not found' });
        }

        const group = ownerResult.rows[0];

        // If user is owner, allow
        if (group.owner_id === userId) {
            return next();
        }

        // Check if user is a member
        const memberResult = await pool.query(
            'SELECT 1 FROM group_members WHERE group_id = $1 AND user_id = $2',
            [groupId, userId]
        );

        if (memberResult.rows.length === 0) {
            return res.status(403).json({ 
                error: 'Forbidden: You must be a member of this group' 
            });
        }

        next();
    } catch (err) {
        console.error('Error checking group membership:', err);
        res.status(500).json({ error: 'Failed to verify permissions' });
    }
};

/**
 * Middleware: Check if user is an admin or owner of the group
 */
export const requireAdminOrOwner = async (req, res, next) => {
    try {
        const groupId = req.params.id;
        const userId = req.user.id;

        // Check if user is owner
        const ownerResult = await pool.query(
            'SELECT owner_id FROM groups WHERE id = $1',
            [groupId]
        );

        if (ownerResult.rows.length === 0) {
            return res.status(404).json({ error: 'Group not found' });
        }

        const group = ownerResult.rows[0];

        // If user is owner, allow
        if (group.owner_id === userId) {
            return next();
        }

        // Check if user is an admin
        const adminResult = await pool.query(
            `SELECT role FROM group_members 
             WHERE group_id = $1 AND user_id = $2 AND role IN ('admin', 'owner')`,
            [groupId, userId]
        );

        if (adminResult.rows.length === 0) {
            return res.status(403).json({ 
                error: 'Forbidden: Only admins and owners can perform this action' 
            });
        }

        next();
    } catch (err) {
        console.error('Error checking admin status:', err);
        res.status(500).json({ error: 'Failed to verify permissions' });
    }
};