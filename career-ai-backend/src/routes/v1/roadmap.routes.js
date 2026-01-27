// ============================================
// routes/roadmap.routes.js
// ============================================
import express from 'express';
import { protect } from '../../middleware/auth.js';
import { successResponse } from '../../utils/response.js';
import { catchAsync } from '../../middleware/errorHandler.js';

const router = express.Router();
router.use(protect);

// Placeholder routes
router.get('/', catchAsync(async (req, res) => {
    return successResponse(res, { roadmaps: [] }, 'Roadmap endpoint - Coming soon');
}));

router.post('/generate', catchAsync(async (req, res) => {
    return successResponse(res, { roadmap: {} }, 'Roadmap generation - Coming soon');
}));

export default router;
