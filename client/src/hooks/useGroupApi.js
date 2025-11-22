import React, { useState, useEffect } from "react";

export function useGroupApi() {
  const [groups, setGroups] = useState([]); // All visible/public groups
  const [myGroups, setMyGroups] = useState([]); // Groups where the user is member/owner
  const [joinRequests, setJoinRequests] = useState([]); // Pending join requests for user's owned groups
  const [loading, setLoading] = useState(false); // Loading state for API calls
  const [error, setError] = useState(null); // Error message (optional)
  const [notification, setNotification] = useState({ message: null, type: "error" }); // Popup notification state
  const [ownerId, setOwnerId] = useState(null);    // Logged-in user's ID
  const [ownerName, setOwnerName] = useState(null); // Logged-in user's username

  const baseURL = import.meta.env.VITE_API_BASE_URL; // API base URL
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        setOwnerId(payload.id);  // Save logged-in user ID
      } catch (err) {
        console.error("Invalid token:", err);
      }
    }
  }, [token]);

  // Call fetchOwnerInfo when ownerId is known
  useEffect(() => {
    if (ownerId) {
      fetchOwnerInfo(ownerId);
    }
  }, [ownerId]);

  const fetchOwnerInfo = async (id) => {  // Get logged-in user's name
    if (!token) return;
    
    try {
      const res = await fetch(`${baseURL}/api/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await res.json();

      if (res.ok) {
        setOwnerName(data.username);  // Save username
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
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchGroupById = async (id) => { // Fetch one group by ID
    if (!token) return null;
    
    try {
      const res = await fetch(`${baseURL}/api/groups/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return await res.json();
    } catch (err) {
      console.error("Failed to fetch group", err);
      return null;
    }
  };

  const createGroup = async (name, description) => { // Create a new group
    if (!token) {
      showError("You must be logged in to create a group");
      return null;
    }

    try {
      const res = await fetch(`${baseURL}/api/groups`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, description }),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        showError(data.error || "Failed to create group");
        return null;
      }
      
      showSuccess("Group created successfully!");
      return data;
    } catch (err) {
      console.error("Failed to create group", err);
      showError("Network error");
      return null;
    }
  };

  const joinGroup = async (groupId) => { // Send join request to group
    if (!token) {
      showError("You must be logged in to join a group");
      return null;
    }

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
    if (!token) return;

    try {
      const res = await fetch(`${baseURL}/api/groups/my`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      setMyGroups(data);
    } catch (err) {
      console.error("Failed to fetch my groups", err);
      setError(err.message);
    }
  };

  const fetchJoinRequests = async () => { // Fetch all pending join requests for owned groups
    if (!token) return;

    try {
      const res = await fetch(`${baseURL}/api/groups`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const allGroups = await res.json();

      if (!ownerId) {
        console.warn("Owner ID not available");
        return;
      }

      const ownedGroups = allGroups.filter((g) => g.owner_id === ownerId); // Only groups user owns

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
      setError(err.message);
    }
  };

  const acceptJoin = async (groupId, requestId) => { // Accept join request
    if (!token) return null;

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
      showSuccess("Join request accepted!");
      return data;
    } catch (err) {
      console.error("Failed to accept join request", err);
      showError("Failed to accept request");
      return null;
    }
  };

  const rejectJoin = async (groupId, requestId) => { // Reject join request
    if (!token) return null;

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
      showSuccess("Join request rejected");
      return data;
    } catch (err) {
      console.error("Failed to reject join request", err);
      showError("Failed to reject request");
      return null;
    }
  };

  const showError = (msg) => { // Show red popup
    setNotification({ message: msg, type: "error" });
    setTimeout(() => setNotification({ message: null, type: "error" }), 3000);
  };

  const showSuccess = (msg) => { // Show green popup
    setNotification({ message: msg, type: "success" });
    setTimeout(() => setNotification({ message: null, type: "success" }), 3000);
  };

  useEffect(() => {
    fetchGroups(); // Load public groups
    if (token) {
      fetchMyGroups(); // Load user's groups
      fetchJoinRequests(); // Load join requests
    }
  }, [token]);

  return {
    groups, // All public groups
    myGroups, // User's groups
    joinRequests, // Pending join requests
    loading, // Loading state
    error, // Error state
    notification, // Popup message
    ownerId, // Logged-in user's ID
    ownerName, // Logged-in user's username
    fetchGroups, // Refresh public groups
    fetchMyGroups, // Refresh user's groups
    fetchJoinRequests, // Refresh join requests
    createGroup, // Create new group
    joinGroup, // Send join request
    acceptJoin, // Accept request
    rejectJoin, // Reject request
    fetchGroupById, // Fetch single group
    setNotification, // Allow manual popup control
  };
}