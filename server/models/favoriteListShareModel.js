import pool from "../helpers/db.js"
import crypto from "crypto"
import { getFavoriteItemsByList } from "./favoriteItemModel.js"

/**
 * Create a shareable link for a favorite list
 * @param {string} listId - UUID of the favorite list
 * @param {number} expirationDays - Optional days until expiration (null = never expires)
 * @returns {Object} Share object with token
 */
export const createShareLink = async (listId, expirationDays = null) => {
    // Check if active share already exists (limit to 1 active share per list)
    const existingShare = await pool.query(
        `SELECT id, share_token, created_at, expires_at 
         FROM favorite_list_shares
         WHERE favorite_list_id = $1 
           AND is_active = true
           AND (expires_at IS NULL OR expires_at > NOW())
         LIMIT 1`,
        [listId]
    )
    
    // If active share exists, return it instead of creating new one
    if (existingShare.rows.length > 0) {
        return existingShare.rows[0]
    }
    
    // Generate cryptographically secure random token
    const shareToken = crypto.randomBytes(32).toString('hex')
    
    // Calculate expiration date if specified
    let expiresAt = null
    if (expirationDays) {
        expiresAt = new Date()
        expiresAt.setDate(expiresAt.getDate() + expirationDays)
    }
    
    const result = await pool.query(
        `INSERT INTO favorite_list_shares (favorite_list_id, share_token, expires_at)
         VALUES ($1, $2, $3)
         RETURNING id, favorite_list_id, share_token, created_at, expires_at, is_active`,
        [listId, shareToken, expiresAt]
    )
    
    return result.rows[0]
}

/**
 * Get shared list by token (public access)
 * @param {string} shareToken - The share token from URL
 * @returns {Object} List details with items and owner info
 */
export const getSharedList = async (shareToken) => {
    const result = await pool.query(
        `SELECT 
            fl.id,
            fl.title,
            fl.description,
            fl.user_id,
            u.username as owner_username,
            fls.created_at as shared_at,
            fls.expires_at,
            fls.is_active
         FROM favorite_list_shares fls
         JOIN favorite_lists fl ON fls.favorite_list_id = fl.id
         JOIN users u ON fl.user_id = u.id
         WHERE fls.share_token = $1
           AND fls.is_active = true
           AND (fls.expires_at IS NULL OR fls.expires_at > NOW())`,
        [shareToken]
    )
    
    if (result.rows.length === 0) {
        return null
    }
    
    const list = result.rows[0]
    
    // Get items in the list - REUSE existing function
    list.items = await getFavoriteItemsByList(list.id)
    
    return list
}

/**
 * Get all share links for a specific list (owner only)
 * @param {string} listId - UUID of the favorite list
 * @returns {Array} Array of share objects
 */
export const getShareLinksForList = async (listId) => {
    const result = await pool.query(
        `SELECT id, share_token, created_at, expires_at, is_active
         FROM favorite_list_shares
         WHERE favorite_list_id = $1
         ORDER BY created_at DESC`,
        [listId]
    )
    
    return result.rows
}

/**
 * Revoke/disable a share link
 * @param {string} shareId - UUID of the share
 * @param {string} userId - User ID to verify ownership
 * @returns {boolean} Success status
 */
export const revokeShareLink = async (shareId, userId) => {
    const result = await pool.query(
        `UPDATE favorite_list_shares
         SET is_active = false
         WHERE id = $1
           AND favorite_list_id IN (
               SELECT id FROM favorite_lists WHERE user_id = $2
           )
         RETURNING id`,
        [shareId, userId]
    )
    
    return result.rowCount > 0
}

/**
 * Delete a share link permanently
 * @param {string} shareId - UUID of the share
 * @param {string} userId - User ID to verify ownership
 * @returns {boolean} Success status
 */
export const deleteShareLink = async (shareId, userId) => {
    const result = await pool.query(
        `DELETE FROM favorite_list_shares
         WHERE id = $1
           AND favorite_list_id IN (
               SELECT id FROM favorite_lists WHERE user_id = $2
           )
         RETURNING id`,
        [shareId, userId]
    )
    
    return result.rowCount > 0
}

/**
 * Check if user owns a list
 * @param {string} listId - UUID of the favorite list
 * @param {string} userId - User ID to check
 * @returns {boolean} True if user owns list
 */
export const isListOwner = async (listId, userId) => {
    const result = await pool.query(
        `SELECT 1 FROM favorite_lists
         WHERE id = $1 AND user_id = $2`,
        [listId, userId]
    )
    
    return result.rowCount > 0
}

/**
 * Clean up expired shares (maintenance function)
 * Can be run as a cron job
 */
export const cleanupExpiredShares = async () => {
    const result = await pool.query(
        `UPDATE favorite_list_shares
         SET is_active = false
         WHERE expires_at < NOW()
           AND is_active = true
         RETURNING id`
    )
    
    return result.rowCount
}