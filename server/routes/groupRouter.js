import { Router } from 'express'
import { auth } from '../helpers/auth.js'
import {
  createGroup,
  getGroupById,
  getGroups,
  updateGroup,
  deleteGroup,
  addMember,
  requestJoin,
  getJoinRequests
} from "../controllers/groupController.js";

const groupRouter = Router();

// Base: /api/groups
groupRouter.get("/groups/", getGroups);

groupRouter.post("/groups/", auth, createGroup);

groupRouter.put("/groups/:id", auth, updateGroup);

groupRouter.delete("/groups/:id", auth, deleteGroup);

groupRouter.post("/groups/:id/members", auth, addMember);

groupRouter.post("/groups/:id/join-request", auth, requestJoin);

groupRouter.get("/groups/:id/join-requests", auth, getJoinRequests);

groupRouter.get("/groups/:id", auth, getGroupById);

export default groupRouter;