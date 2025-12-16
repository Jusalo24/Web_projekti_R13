import { useState } from "react";

export function useShareApi(token) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState({ message: null, type: "success" });

  const baseURL = import.meta.env.VITE_API_BASE_URL;

  const showSuccess = (msg) => {
    setNotification({ message: msg, type: "success" });
    setTimeout(() => setNotification({ message: null }), 3000);
  };

  const showError = (msg) => {
    setNotification({ message: msg, type: "error" });
    setTimeout(() => setNotification({ message: null }), 3000);
  };

  // Create a share link for a list
  const createShareLink = async (listId, expirationDays = null) => {
    setLoading(true);
    setError(null);

    try {
      const body = expirationDays ? { expirationDays } : {};
      
      const res = await fetch(`${baseURL}/api/favorite-lists/${listId}/share`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create share link");
      }

      showSuccess("Share link created!");
      return data;
    } catch (err) {
      setError(err.message);
      showError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Get all share links for a list
  const getShareLinks = async (listId) => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${baseURL}/api/favorite-lists/${listId}/shares`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to fetch share links");
      }

      return data;
    } catch (err) {
      setError(err.message);
      showError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Revoke a share link
  const revokeShareLink = async (shareId) => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${baseURL}/api/favorite-lists/shares/${shareId}/revoke`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to revoke share link");
      }

      showSuccess("Share link revoked");
      return true;
    } catch (err) {
      setError(err.message);
      showError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Delete a share link permanently
  const deleteShareLink = async (shareId) => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${baseURL}/api/favorite-lists/shares/${shareId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to delete share link");
      }

      showSuccess("Share link deleted");
      return true;
    } catch (err) {
      setError(err.message);
      showError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Get shared list by token (PUBLIC - no auth required)
  const getSharedList = async (shareToken) => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${baseURL}/api/shared/${shareToken}`);

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to fetch shared list");
      }

      return data;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Copy text to clipboard
  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      showSuccess("Link copied to clipboard!");
      return true;
    } catch (err) {
      showError("Failed to copy link");
      return false;
    }
  };

  return {
    loading,
    error,
    notification,
    setNotification,
    createShareLink,
    getShareLinks,
    revokeShareLink,
    deleteShareLink,
    getSharedList,
    copyToClipboard,
    showSuccess,
    showError
  };
}
