import express from 'express';
import { personalInformation } from '../../controllers/profile.controller.js';
import { protect } from '../../middleware/auth.js';

const router = express.Router();

// Protect route so req.user mil sake
router.get('/', protect, personalInformation);

export default router;