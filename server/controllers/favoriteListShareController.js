import {
    createShareLink,
    getSharedList,
    getShareLinksForList,
    revokeShareLink,
    deleteShareLink,
    isListOwner
} from "../models/favoriteListShareModel.js"

// Validate share token format (64 hex characters)
const validateShareToken = (token) => {
    return /^[a-f0-9]{64}$/.test(token)
}

/**
 * Create a shareable link for a favorite list
 * POST /api/favorite-lists/:listId/share
 * Body: { expirationDays?: number }
 */
export const createShare = async (req, res) => {
    try {
        const { listId } = req.params
        const { expirationDays } = req.body
        const userId = req.user.id

        // Verify user owns the list
        const ownslist = await isListOwner(listId, userId)
        if (!ownslist) {
            return res.status(403).json({ 
                error: 'You can only share your own lists' 
            })
        }

        // Validate expiration days
        if (expirationDays !== undefined) {
            const days = parseInt(expirationDays, 10)
            if (isNaN(days) || days < 1 || days > 365) {
                return res.status(400).json({
                    error: 'Expiration days must be between 1 and 365'
                })
            }
        }

        // Create share link
        const share = await createShareLink(listId, expirationDays)

        // Generate full shareable URL
        const shareUrl = `${process.env.CLIENT_URL}/shared/${share.share_token}`

        res.status(201).json({
            message: 'Share link created successfully',
            shareUrl,
            shareToken: share.share_token,
            expiresAt: share.expires_at,
            createdAt: share.created_at
        })
    } catch (err) {
        console.error('Error creating share link:', err.message)
        res.status(500).json({ error: 'Failed to create share link' })
    }
}

/**
 * Get a shared list by token (PUBLIC - no auth required)
 * GET /api/shared/:shareToken
 */
export const getShared = async (req, res) => {
    try {
        const { shareToken } = req.params

        if (!shareToken) {
            return res.status(400).json({ error: 'Share token is required' })
        }

        // Validate token format to prevent unnecessary DB queries
        if (!validateShareToken(shareToken)) {
            return res.status(404).json({ 
                error: 'Shared list not found or has expired' 
            })
        }

        // Get shared list
        const sharedList = await getSharedList(shareToken)

        if (!sharedList) {
            return res.status(404).json({ 
                error: 'Shared list not found or has expired' 
            })
        }

        // Optional: Hide owner username for privacy (uncomment if needed)
        // delete sharedList.owner_username

        res.status(200).json({
            title: sharedList.title,
            description: sharedList.description,
            ownerUsername: sharedList.owner_username,  // Remove if privacy concern
            items: sharedList.items,
            sharedAt: sharedList.shared_at,
            expiresAt: sharedList.expires_at
        })
    } catch (err) {
        console.error('Error fetching shared list:', err.message)
        res.status(500).json({ error: 'Failed to fetch shared list' })
    }
}

/**
 * Get all share links for a specific list (protected)
 * GET /api/favorite-lists/:listId/shares
 */
export const getListShares = async (req, res) => {
    try {
        const { listId } = req.params
        const userId = req.user.id

        // Verify user owns the list
        const ownsList = await isListOwner(listId, userId)
        if (!ownsList) {
            return res.status(403).json({ 
                error: 'You can only view shares for your own lists' 
            })
        }

        // Get all shares for this list
        const shares = await getShareLinksForList(listId)

        // Generate full URLs
        const sharesWithUrls = shares.map(share => ({
            id: share.id,
            shareUrl: `${process.env.CLIENT_URL}/shared/${share.share_token}`,
            shareToken: share.share_token,
            createdAt: share.created_at,
            expiresAt: share.expires_at,
            isActive: share.is_active,
            isExpired: share.expires_at && new Date(share.expires_at) < new Date()
        }))

        res.status(200).json(sharesWithUrls)
    } catch (err) {
        console.error('Error fetching share links:', err.message)
        res.status(500).json({ error: 'Failed to fetch share links' })
    }
}

/**
 * Revoke/disable a share link (protected)
 * PATCH /api/favorite-lists/shares/:shareId/revoke
 */
export const revokeShare = async (req, res) => {
    try {
        const { shareId } = req.params
        const userId = req.user.id

        const success = await revokeShareLink(shareId, userId)

        if (!success) {
            return res.status(404).json({ 
                error: 'Share link not found or you do not own this list' 
            })
        }

        res.status(200).json({ 
            message: 'Share link revoked successfully' 
        })
    } catch (err) {
        console.error('Error revoking share link:', err.message)
        res.status(500).json({ error: 'Failed to revoke share link' })
    }
}

/**
 * Delete a share link permanently (protected)
 * DELETE /api/favorite-lists/shares/:shareId
 */
export const deleteShare = async (req, res) => {
    try {
        const { shareId } = req.params
        const userId = req.user.id

        const success = await deleteShareLink(shareId, userId)

        if (!success) {
            return res.status(404).json({ 
                error: 'Share link not found or you do not own this list' 
            })
        }

        res.status(200).json({ 
            message: 'Share link deleted successfully' 
        })
    } catch (err) {
        console.error('Error deleting share link:', err.message)
        res.status(500).json({ error: 'Failed to delete share link' })
    }
}