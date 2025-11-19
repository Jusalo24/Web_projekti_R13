import { Router } from "express"
import { auth } from "../helpers/auth.js"
import {
  createList,
  getUserLists,
  getListItems,
  addItemToList,
  deleteItem
} from "../controllers/favoriteListController.js"

const router = Router()

router.post("/favorite-lists", auth, createList)
router.get("/favorite-lists", auth, getUserLists)
router.get("/favorite-lists/:listId/items", auth, getListItems)
router.post("/favorite-lists/:listId/items", auth, addItemToList)
router.delete("/favorite-lists/items/:itemId", auth, deleteItem)

export default router
