import groupService from "../services/groupService.js";

// Create a new group
// POST /api/groups/groups  | body: { name, description }
export async function createGroup(req, res) {
    try {
        const ownerId = req.user.id;
        const group = await groupService.createGroup(ownerId, req.body);
        res.status(201).json(group);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to create group" });
    }
}

// Get single group by ID
// GET /api/groups/groups/:id  | params: { id }
export async function getGroupById(req, res) {
    try {
        const group = await groupService.getGroupById(req.params.id);
        if (!group) return res.status(404).json({ error: "Group not found" });
        res.json(group);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch group" });
    }
}

// Get groups the logged-in user belongs to
// GET /api/groups/my
export async function getMyGroups(req, res) {
    try {
        const userId = req.user.id;

        const groups = await groupService.getUserGroups(userId);

        return res.json(groups);
    } catch (err) {
        console.error("Failed to fetch user groups", err);
        res.status(500).json({ error: "Failed to fetch user groups" });
    }
}

// Get all visible groups
// GET /api/groups/groups  | no params, no body
export async function getGroups(req, res) {
    try {
        const groups = await groupService.getGroups();
        res.json(groups);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch groups" });
    }
}

// Update a group
// PUT /api/groups/groups/:id  | params: { id }, body: { name?, description?, isVisible? }
export async function updateGroup(req, res) {
    try {
        const updated = await groupService.updateGroup(req.params.id, req.body);
        res.json(updated);
    } catch (err) {
        res.status(500).json({ error: "Failed to update group" });
    }
}

// Delete a group
// DELETE /api/groups/groups/:id  | params: { id }
export async function deleteGroup(req, res) {
    try {
        await groupService.deleteGroup(req.params.id);
        res.status(204).send();
    } catch (err) {
        res.status(500).json({ error: "Failed to delete group" });
    }
}

// Add a member directly to a group
// POST /api/groups/groups/:id/members  | params: { id }, body: { userId }
export async function addMember(req, res) {
    try {
        const member = await groupService.addMember(
            req.params.id,
            req.body.userId
        );
        if (!member)
            return res.status(409).json({ error: "User already in group" });
        res.status(201).json(member);
    } catch (err) {
        res.status(500).json({ error: "Failed to add member" });
    }
}

// Send a join request to the group
// POST /api/groups/groups/:id/join-request  | params: { id }, no body
export async function requestJoin(req, res) {
    try {
        const joinReq = await groupService.createJoinRequest(
            req.params.id,
            req.user.id
        );

        if (!joinReq)
            return res
                .status(409)
                .json({ error: "Pending request exists or already a member" });

        res.status(201).json(joinReq);
    } catch (err) {
        res.status(500).json({ error: "Failed to create join request" });
    }
}

// Get all join requests for a group
// GET /api/groups/groups/:id/join-requests  | params: { id }
export async function getJoinRequests(req, res) {
    try {
        const requests = await groupService.getJoinRequests(req.params.id);
        res.json(requests);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch join requests" });
    }
}

// Accept group join request
// PATCH /api/groups/:id/join-requests/:requestId/accept | params: { id, requestId }
export async function acceptJoin(req, res) {
    try {
        const result = await groupService.acceptJoin(req.params.requestId);

        if (!result)
            return res.status(404).json({ error: "Join request not found" });

        res.json({ message: "Join request accepted", ...result });
    } catch (err) {
        res.status(500).json({ error: "Failed to accept join request" });
    }
}

// Reject group join request
// PATCH /api/groups/:id/join-requests/:requestId/reject | params: { id, requestId }
export async function rejectJoin(req, res) {
    try {
        const result = await groupService.rejectJoin(req.params.requestId);

        if (!result)
            return res.status(404).json({ error: "Join request not found" });

        res.json({ message: "Join request rejected", ...result });
    } catch (err) {
        res.status(500).json({ error: "Failed to reject join request" });
    }
}