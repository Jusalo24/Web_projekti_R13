import React, { useState, useEffect } from "react";

export function useGroupApi() {
  const [groups, setGroups] = useState([]); // All visible/public groups
  const [myGroups, setMyGroups] = useState([]); // Groups where the user is member/owner
  const [joinRequests, setJoinRequests] = useState([]); // Pending join requests for user's owned groups
  const [loading, setLoading] = useState(false); // Loading state for API calls
  const [error, setError] = useState(null); // Error message (optional)
  const [notification, setNotification] = useState({ message: null, type: "error" }); // Popup notification state
  const [loggedInId, setloggedInId] = useState(null);    // Logged-in user's ID
  const [loggedInName, setloggedInName] = useState(null); // Logged-in user's username


  const baseURL = import.meta.env.VITE_API_BASE_URL; // API base URL
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (token) {
      const payload = JSON.parse(atob(token.split(".")[1]));
      setloggedInId(payload.id);  // Save logged-in user ID
      console.log("Logged-in user ID:", payload.id);
    }
  }, [token]);

  // Call fetchOwnerInfo, when loggedInId is known
  useEffect(() => {
    if (loggedInId) {
      fetchOwnerInfo(loggedInId);
    }
  }, [loggedInId]);


  const fetchOwnerInfo = async (id) => {  // Get logged-in user's name
    try {
      const res = await fetch(`${baseURL}/api/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await res.json();

      if (res.ok) {
        setloggedInName(data.username);  // Save username
      }
    } catch (err) {
      console.error("Failed to fetch owner info", err);
    }
  };


  const fetchGroups = async () => { // Fetch all public groups
    setLoading(true);
    try {
      const res = await fetch(`${baseURL}/api/groups`);
      const data = await res.json();
      setGroups(data);
    } catch (err) {
      console.error("Failed to fetch groups", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchGroupById = async (id) => { // Fetch one group by ID
    try {
      const res = await fetch(`${baseURL}/api/groups/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return await res.json();
    } catch (err) {
      console.error("Failed to fetch group", err);
    }
  };

  const createGroup = async (name, description) => { // Create a new group
    try {
      const res = await fetch(`${baseURL}/api/groups`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, description }),
      });
      return await res.json();
    } catch (err) {
      console.error("Failed to create group", err);
    }
  };

  const joinGroup = async (groupId) => { // Send join request to group
    try {
      const res = await fetch(`${baseURL}/api/groups/${groupId}/join-request`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();

      if (!res.ok) {
        showError(data.error || "Join request failed"); // Show error popup
        return null;
      }

      showSuccess("Join request sent!"); // Show success popup
      return data;

    } catch (err) {
      showError("Network error"); // Network error popup
      return null;
    }
  };

  const fetchMyGroups = async () => { // Fetch groups user belongs to
    try {
      const payload = JSON.parse(atob(token.split(".")[1])); // Decode JWT
      const userId = payload.id;

      const res = await fetch(`${baseURL}/api/groups/my`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      setMyGroups(data);
    } catch (err) {
      console.error("Failed to fetch my groups", err);
    }
  };

  const fetchJoinRequests = async () => { // Fetch all pending join requests for owned groups
    try {
      const res = await fetch(`${baseURL}/api/groups`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const allGroups = await res.json();

      const payload = JSON.parse(atob(token.split(".")[1])); // Decode token
      const userId = payload.id;

      const ownedGroups = allGroups.filter((g) => g.owner_id === userId); // Only groups user owns

      const pending = [];

      for (const group of ownedGroups) { // Fetch join requests for each group
        const jrRes = await fetch(
          `${baseURL}/api/groups/${group.id}/join-requests`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const requests = await jrRes.json();

        if (!Array.isArray(requests)) { // Skip invalid response
          console.warn("Skipping invalid join request response:", requests);
          continue;
        }

        pending.push(
          ...requests.map((r) => ({ ...r, groupName: group.name })) // Include group name
        );

      }

      setJoinRequests(pending); // Update state
    } catch (err) {
      console.error("Failed to fetch join requests", err);
    }
  };

  const acceptJoin = async (groupId, requestId) => { // Accept join request
    try {
      const res = await fetch(
        `${baseURL}/api/groups/${groupId}/join-requests/${requestId}/accept`,
        {
          method: "PATCH",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();
      await fetchJoinRequests(); // Refresh list
      return data;
    } catch (err) {
      console.error("Failed to accept join request", err);
    }
  };

  const rejectJoin = async (groupId, requestId) => { // Reject join request
    try {
      const res = await fetch(
        `${baseURL}/api/groups/${groupId}/join-requests/${requestId}/reject`,
        {
          method: "PATCH",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();
      await fetchJoinRequests(); // Refresh
      return data;
    } catch (err) {
      console.error("Failed to reject join request", err);
    }
  };

  const removeMemberFromGroup = async (groupId, userId) => { // Kick member from group
    try {
      const res = await fetch(
        `${baseURL}/api/groups/${groupId}/members?userId=${userId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();
      return data;
    } catch (err) {
      console.error("Failed to remove member from group", err);
    }
  };

  // POST /api/groups/:id/movies | query: { movieId, mediaType }
  const addMovieToGroup = async (groupId, movieId, mediaType) => { // Add movie to group
    try {
      const res = await fetch(
        `${baseURL}/api/groups/${groupId}/movies?movieId=${movieId}&mediaType=${mediaType}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          query: { movieId, mediaType }
        }
      );
      const data = await res.json();
      return data;
    } catch (err) {
      console.error("Failed to add movie to group", err);
    }
  };

  // DELETE /api/groups/:id/movies | query: { movieId, mediaType }
  const removeMovieFromGroup = async (groupId, movieId, mediaType) => { // Remove movie from group
    try {
      const res = await fetch(
        `${baseURL}/api/groups/${groupId}/movies?movieId=${movieId}&mediaType=${mediaType}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          query: { movieId, mediaType }
        }
      );
      console.log("Fetch URL:", `${baseURL}/api/groups/${groupId}/movies?movieId=${movieId}&mediaType=${mediaType}`);
      const data = await res.json();
      return data;
    } catch (err) {
      console.error("Failed to remove movie from group", err);
    }
  };

  // DELETE /api/groups/:id
  const deleteGroup = async (groupId) => {
    try {
      const res = await fetch(
        `${baseURL}/api/groups/${groupId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();
      return data;
    } catch (err) {
      console.error("Failed to delete group", err);
    }
  }

  // GET /api/groups/:id/movies
  const fetchMoviesByGroup = async (groupId) => { // List movies in group
    try {
      const res = await fetch(
        `${baseURL}/api/groups/${groupId}/movies`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          }
        }
      );
      const data = await res.json();
      return data;
    } catch (err) {
      console.error("Failed to get movies by group", err);
    }
  };

  const showError = (msg) => { // Show red popup
    setNotification({ message: msg, type: "error" });
    setTimeout(() => setNotification({ message: null }), 3000);
  };

  const showSuccess = (msg) => { // Show green popup
    setNotification({ message: msg, type: "success" });
    setTimeout(() => setNotification({ message: null }), 3000);
  };

  useEffect(() => {
    fetchGroups(); // Load public groups
    fetchMyGroups(); // Load user's groups
    fetchJoinRequests(); // Load join requests
  }, []);

  return {
    groups, // All public groups
    myGroups, // User's groups
    joinRequests, // Pending join requests
    loading, // Loading state
    error, // Error state
    notification, // Popup message
    loggedInId, // Logged-in user's ID
    loggedInName, // Logged-in user's username
    showError,
    showSuccess,
    fetchGroups, // Refresh public groups
    fetchMyGroups, // Refresh user's groups
    fetchJoinRequests, // Refresh join requests
    createGroup, // Create new group
    joinGroup, // Send join request
    acceptJoin, // Accept request
    rejectJoin, // Reject request
    fetchGroupById, // Fetch single group
    setNotification, // Allow manual popup control
    addMovieToGroup, // Add movie to group
    removeMovieFromGroup, // Remove movie from group
    fetchMoviesByGroup, // List movies in group
    removeMemberFromGroup, // Remove member from group
    deleteGroup // Delete
  };
}