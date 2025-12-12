import {
  createFavoriteList,
  getFavoriteListsByUser,
  getFavoriteListById,
  deleteFavoriteList
} from "../models/favoriteListModel.js"

import {
  addFavoriteItem,
  getFavoriteItemsByList,
  deleteFavoriteItem
} from "../models/favoriteItemModel.js"

// Create default list or custom
export const createList = async (req, res) => {
  try {
    const userId = req.user.id
    const { title, description } = req.body

    const list = await createFavoriteList(userId, title, description)
    
    res.status(201).json(list)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
}

export const getUserLists = async (req, res) => {
  try {
    const userId = req.user.id
    const lists = await getFavoriteListsByUser(userId)
    res.json(lists)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
}

export const getListItems = async (req, res) => {
  try {
    const { listId } = req.params
    const items = await getFavoriteItemsByList(listId)
    res.json(items)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
}

export const addItemToList = async (req, res) => {
  try {
    console.log("HEADERS:", req.headers["content-type"])
    console.log("BODY:", req.body)
    console.log("PARAMS:", req.params)
    const { listId } = req.params
    const { movie_external_id, position } = req.body

    if (!movie_external_id) {
      return res.status(400).json({ error: "movie_external_id is required" })
    }

    const item = await addFavoriteItem(
      listId,
      movie_external_id,
      position ?? 0
    )

    res.status(201).json(item)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
}


export const deleteItem = async (req, res) => {
  try {
    const { itemId } = req.params

    await deleteFavoriteItem(itemId)
    res.json({ success: true })
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
}
