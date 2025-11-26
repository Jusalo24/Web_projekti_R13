import { useState } from "react";

export function useFavoritesApi(token) {
    const [notification, setNotification] = useState({ message: null, type: "success" });
    const baseURL = import.meta.env.VITE_API_BASE_URL; // API base URL

    const showSuccess = (msg) => {
        setNotification({ message: msg, type: "success" });
        setTimeout(() => setNotification({ message: null }), 3000);
    };

    const showError = (msg) => {
        setNotification({ message: msg, type: "error" });
        setTimeout(() => setNotification({ message: null }), 3000);
    };

    const getLists = async () => {
        const res = await fetch(`${baseURL}/api/favorite-lists`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        if (!res.ok) return [];
        return await res.json();
    };

    const getOrCreateDefaultList = async () => {
        let lists = await getLists();
        let def = lists.find((l) => l.title === "My Favorites");

        if (!def) {
            const res = await fetch(`${baseURL}/api/favorite-lists`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    title: "My Favorites",
                    description: "My favorite movies and TV shows"
                })
            });

            if (!res.ok) {
                showError("Failed to create favorites list");
                return null;
            }

            def = await res.json();
        }

        return def;
    };

    const addToFavorites = async (mediaType, id) => {
        const list = await getOrCreateDefaultList();
        if (!list) return null;

        const movieId = `${mediaType}:${id}`;

        const res = await fetch(`${baseURL}/api/favorite-lists/${list.id}/items`, {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify({ movieId, position: 0 })
        });

        let data = {};
        try {
            data = await res.json();
        } catch (e) {
            data = {};
        }

        if (!res.ok) {
            showError(data.error || "Failed to add to favorites");
            return { error: data.error };
        }

        showSuccess("Added to favorites!");
        return data;
    };


    const removeFromFavorites = async (mediaType, id) => {
        const lists = await getLists();
        const movieId = `${mediaType}:${id}`;

        for (const list of lists) {
            const itemsRes = await fetch(`${baseURL}/api/favorite-lists/${list.id}/items`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (!itemsRes.ok) continue;

            const items = await itemsRes.json();
            const item = items.find((i) => i.movie_external_id === movieId);
            if (!item) continue;

            const deleteRes = await fetch(`${baseURL}/api/favorite-lists/items/${item.id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` }
            });

            if (deleteRes.ok) {
                showSuccess("Removed from favorites");
                return true;
            }
        }

        showError("Not found in favorites");
        return false;
    };

    const isFavorite = async (mediaType, id) => {
        const lists = await getLists();
        const movieId = `${mediaType}:${id}`;

        for (const list of lists) {
            const itemsRes = await fetch(`${baseURL}/api/favorite-lists/${list.id}/items`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (!itemsRes.ok) continue;

            const items = await itemsRes.json();
            if (items.some((i) => i.movie_external_id === movieId)) {
                return true;
            }
        }

        return false;
    };

    return {
        notification,
        setNotification,
        addToFavorites,
        removeFromFavorites,
        isFavorite,
        getLists,
        getOrCreateDefaultList,
        showSuccess,
        showError
    };
}
