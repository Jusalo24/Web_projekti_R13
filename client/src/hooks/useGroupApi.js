import { useState, useEffect } from "react";

export function useGroupApi() {
  const [groups, setGroups] = useState([]);
  const [myGroups, setMyGroups] = useState([]);
  const [joinRequests, setJoinRequests] = useState([]);
  const [loading, setLoading] = useState(false);

  const baseURL = import.meta.env.VITE_API_BASE_URL;
  const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjExMTExMTExLTExMTEtMTExMS0xMTExLTExMTExMTExMTExMSIsImVtYWlsIjoiYWxpY2VAZXhhbXBsZS5jb20iLCJpYXQiOjE3NjM2ODExNTIsImV4cCI6MTc2NDI4NTk1Mn0.o_lsC6O0cLoEStAdEkUX3mfxU4RwMCOHxWX-L538hZQ';

  const fetchGroups = async () => {
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

  // Get single group
  const fetchGroupById = async (id) => {
    try {
      const res = await fetch(`${baseURL}/api/groups/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return await res.json();
    } catch (err) {
      console.error("Failed to fetch group", err);
    }
  };

  const createGroup = async (name, description) => {
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

  const joinGroup = async (groupId) => {
    try {
      const res = await fetch(`${baseURL}/api/groups/${groupId}/join-request`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      return await res.json();
    } catch (err) {
      console.error("Join request failed", err);
    }
  };

  const fetchMyGroups = async () => {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
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

  const fetchJoinRequests = async () => {
    try {
      const res = await fetch(`${baseURL}/api/groups`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const allGroups = await res.json();

      const payload = JSON.parse(atob(token.split(".")[1]));
      const userId = payload.id;

      const ownedGroups = allGroups.filter((g) => g.owner_id === userId);

      const pending = [];

      for (const group of ownedGroups) {
        const jrRes = await fetch(
          `${baseURL}/api/groups/${group.id}/join-requests`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const requests = await jrRes.json();

        pending.push(
          ...requests.map((r) => ({ ...r, groupName: group.name }))
        );
      }

      setJoinRequests(pending);
    } catch (err) {
      console.error("Failed to fetch join requests", err);
    }
  };

  const acceptJoin = async (groupId, requestId) => {
    try {
      const res = await fetch(
        `${baseURL}/api/groups/${groupId}/join-requests/${requestId}/accept`,
        {
          method: "PATCH",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();
      await fetchJoinRequests();
      return data;
    } catch (err) {
      console.error("Failed to accept join request", err);
    }
  };

  const rejectJoin = async (groupId, requestId) => {
    try {
      const res = await fetch(
        `${baseURL}/api/groups/${groupId}/join-requests/${requestId}/reject`,
        {
          method: "PATCH",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();
      await fetchJoinRequests();
      return data;
    } catch (err) {
      console.error("Failed to reject join request", err);
    }
  };

  useEffect(() => {
    fetchGroups();
    fetchMyGroups();
    fetchJoinRequests();
  }, []);

  return {
    groups,
    myGroups,
    joinRequests,
    loading,
    createGroup,
    joinGroup,
    acceptJoin,
    rejectJoin,
    fetchGroupById,
  };
}