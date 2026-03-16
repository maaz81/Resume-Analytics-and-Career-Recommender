import express from 'express';
import { protect } from '../../middleware/auth.js';
import {
    newConversation,
    listConversations,
    getHistory,
    chat,
    chatStream,
} from '../../controllers/chatMain.controller.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

router.post('/conversations', newConversation);
router.get('/conversations', listConversations);
router.get('/conversations/:id/history', getHistory);
router.post('/conversations/:id/chat', chat);
router.post('/conversations/:id/stream', chatStream);  // SSE streaming

export default router;