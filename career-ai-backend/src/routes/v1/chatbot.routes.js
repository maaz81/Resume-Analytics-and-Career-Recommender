import express from 'express';
import { createConversation, getAllConversations, getConversationById, sendMessage, deleteConversation } from '../../controllers/chatbot.controller.js';
import { protect } from '../../middleware/auth.js';

const router = express.Router();

router.use(protect); // Auth middleware

router.post('/', createConversation);
router.get('/', getAllConversations);
router.get('/:id', getConversationById);
router.post('/:id/message', sendMessage);
router.delete('/:id', deleteConversation);

export default router;