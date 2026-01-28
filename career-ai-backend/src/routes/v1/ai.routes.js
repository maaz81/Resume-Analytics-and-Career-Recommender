// ============================================
// routes/ai.routes.js - Career Assistant Chat
// ============================================
import express from 'express';
import { protect } from '../../middleware/auth.js';
import { aiLimiter } from '../../middleware/rateLimiter.js';
import * as aiController from '../../controllers/ai.controller.js';

const router = express.Router();
router.use(protect);

/**
 * Send message to AI career assistant
 * POST /api/v1/ai/chat
 */
router.post('/chat', aiLimiter, aiController.chat);

/**
 * Get conversation history
 */
router.get('/conversations/:id', aiController.getConversation);

export default router;