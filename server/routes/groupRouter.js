import { Router } from 'express';
import { auth } from '../helpers/auth.js';

import {
    createGroup,
    getGroupById,
    getGroups,
    updateGroup,
    deleteGroup,
    addMember,
    requestJoin,
    getJoinRequests,
    acceptJoin,
    rejectJoin,
    getMyGroups,
    removeMember,
    leaveGroup
} from "../controllers/groupController.js";

import { requireOwner, requireMemberOrOwner } from '../helpers/groupRoles.js';

import {
    addMovieToGroup,
    removeMovieFromGroup,
    getMoviesInGroup
} from '../controllers/groupMovieController.js';

const groupRouter = Router();

// Get all public groups
// GET /api/groups
groupRouter.get("/groups/", getGroups);

// Create a new group (auth)
// POST /api/groups | body: { name, description }
groupRouter.post("/groups/", auth, createGroup);

// Update group by id (auth)
// PUT /api/groups/:id | params: { id }  body: { name?, description?, isVisible? }
groupRouter.put("/groups/:id", auth, requireOwner, updateGroup);

// Get groups the user owns or is member of
// GET /api/groups/my
groupRouter.get("/groups/my", auth, getMyGroups);

// Delete group by id (auth)
// DELETE /api/groups/:id | params: { id }  no body
groupRouter.delete("/groups/:id", auth, requireOwner, deleteGroup);

// Add member to group (auth)
// POST /api/groups/:id/members | params: { id }  query: { userId }
groupRouter.post("/groups/:id/members", auth, requireOwner, addMember);

// Remove member from group (auth)
// DELETE /api/groups/:id/members | params: { id }  query: { userId }
groupRouter.delete("/groups/:id/members", auth, requireOwner, removeMember);

// Member leaves group themself (auth)
// DELETE /api/groups/:id/leave | params: { id }
groupRouter.delete("/groups/:id/leave", auth, requireMemberOrOwner, leaveGroup);

// Send join request to group (auth)
// POST /api/groups/:id/join-request | params: { id }  no body
groupRouter.post("/groups/:id/join-request", auth, requestJoin);

// Get join requests for a group (auth)
// GET /api/groups/:id/join-requests | params: { id }  no body
groupRouter.get("/groups/:id/join-requests", auth, getJoinRequests);

// Get single group by id (auth)
// GET /api/groups/:id | params: { id }  no body
groupRouter.get("/groups/:id", auth, requireMemberOrOwner,getGroupById);

// Accept join request (owner)
// PATCH /api/groups/:id/join-requests/:requestId/accept
groupRouter.patch(
    "/groups/:id/join-requests/:requestId/accept",
    auth,
    requireOwner,
    acceptJoin
);

// Reject join request (owner)
// PATCH /api/groups/:id/join-requests/:requestId/reject
groupRouter.patch(
    "/groups/:id/join-requests/:requestId/reject",
    auth,
    requireOwner,
    rejectJoin
);

// Add movie to group
// POST /api/groups/:id/movies | query: { movieId, mediaType }
groupRouter.post(
    "/groups/:id/movies",
    auth,
    requireMemberOrOwner,
    addMovieToGroup
);

// Remove movie
// DELETE /api/groups/:id/movies | query: { movieId, mediaType }
groupRouter.delete(
    "/groups/:id/movies",
    auth,
    requireMemberOrOwner,
    removeMovieFromGroup
);

// List group movies
// GET /api/groups/:id/movies
groupRouter.get(
    "/groups/:id/movies",
    auth,
    requireMemberOrOwner,
    getMoviesInGroup
);

export default groupRouter;