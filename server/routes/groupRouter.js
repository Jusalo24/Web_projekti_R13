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
    rejectJoin
} from "../controllers/groupController.js";

import { requireAdminOrOwner } from '../helpers/groupRoles.js';

import {
    addMovieToGroup,
    removeMovieFromGroup,
    getMoviesInGroup
} from '../controllers/groupMovieController.js';

const groupRouter = Router();

// Get all public groups
// GET /api/groups/groups
groupRouter.get("/groups/", getGroups);

// Create a new group (auth)
// POST /api/groups/groups | body: { name, description }
groupRouter.post("/groups/", auth, createGroup);

// Update group by id (auth)
// PUT /api/groups/groups/:id | params: { id }  body: { name?, description?, isVisible? }
groupRouter.put("/groups/:id", auth, updateGroup);

// Delete group by id (auth)
// DELETE /api/groups/groups/:id | params: { id }  no body
groupRouter.delete("/groups/:id", auth, deleteGroup);

// Add member to group (auth)
// POST /api/groups/groups/:id/members | params: { id }  body: { userId }
groupRouter.post("/groups/:id/members", auth, addMember);

// Send join request to group (auth)
// POST /api/groups/groups/:id/join-request | params: { id }  no body
groupRouter.post("/groups/:id/join-request", auth, requestJoin);

// Get join requests for a group (auth)
// GET /api/groups/groups/:id/join-requests | params: { id }  no body
groupRouter.get("/groups/:id/join-requests", auth, getJoinRequests);

// Get single group by id (auth)
// GET /api/groups/groups/:id | params: { id }  no body
groupRouter.get("/groups/:id", auth, getGroupById);

// Accept join request (admin/owner)
// PATCH /api/groups/groups/:id/join-requests/:requestId/accept
groupRouter.patch(
    "/groups/:id/join-requests/:requestId/accept",
    auth,
    requireAdminOrOwner,
    acceptJoin
);

// Reject join request (admin/owner)
// PATCH /api/groups/groups/:id/join-requests/:requestId/reject
groupRouter.patch(
    "/groups/:id/join-requests/:requestId/reject",
    auth,
    requireAdminOrOwner,
    rejectJoin
);

// Add movie to group
// POST /api/groups/groups/:id/movies  | body: { movieId }
groupRouter.post(
    "/groups/:id/movies",
    auth,
    requireAdminOrOwner,
    addMovieToGroup
);

// Remove movie
// DELETE /api/groups/groups/:id/movies/:movieId
groupRouter.delete(
    "/groups/:id/movies/:movieId",
    auth,
    requireAdminOrOwner,
    removeMovieFromGroup
);

// List group movies
// GET /api/groups/groups/:id/movies
groupRouter.get(
    "/groups/:id/movies",
    auth,
    getMoviesInGroup
);

export default groupRouter;