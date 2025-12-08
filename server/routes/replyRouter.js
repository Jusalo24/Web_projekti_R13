import { Router } from 'express';
import { createReply } from '../controllers/replyController.js';
import { auth } from '../helpers/auth.js';

const replyRouter = Router();

replyRouter.post('/replies', auth, createReply);

export default replyRouter;
