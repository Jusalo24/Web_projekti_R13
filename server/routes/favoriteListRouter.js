import { Router } from "express"
import { auth } from "../helpers/auth.js"
import { apiLimiter } from "../helpers/rateLimiter.js"
import {
  createList,
  getUserLists,
  getListItems,
  addItemToList,
  deleteItem
} from "../controllers/favoriteListController.js"
import {
  createShare,
  getShared,
  getListShares,
  revokeShare,
  deleteShare
} from "../controllers/favoriteListShareController.js"

const router = Router()

// Create a new list (protected)
router.post("/favorite-lists", auth, createList)

// Get user's lists (protected)
router.get("/favorite-lists", auth, getUserLists)

// Get items in a list (protected)
router.get("/favorite-lists/:listId/items", auth, getListItems)

// Add item to list (protected)
router.post("/favorite-lists/:listId/items", auth, addItemToList)

// Delete item from list (protected)
router.delete("/favorite-lists/items/:itemId", auth, deleteItem)

// Create a shareable link for a list (protected)
// POST /api/favorite-lists/:listId/share
// Body: { expirationDays?: number }
router.post("/favorite-lists/:listId/share", auth, createShare)

// Get all share links for a list (protected)
// GET /api/favorite-lists/:listId/shares
router.get("/favorite-lists/:listId/shares", auth, getListShares)

// Revoke a share link (protected)
// PATCH /api/favorite-lists/shares/:shareId/revoke
router.patch("/favorite-lists/shares/:shareId/revoke", auth, revokeShare)

// Delete a share link (protected)
// DELETE /api/favorite-lists/shares/:shareId
router.delete("/favorite-lists/shares/:shareId", auth, deleteShare)

// Get shared list by token (PUBLIC - no auth required)
// Rate limited to prevent brute force attacks
// GET /api/shared/:shareToken
router.get("/shared/:shareToken", apiLimiter, getShared)

export default router
