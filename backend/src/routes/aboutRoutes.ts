import express from 'express';
import { getAboutContent, updateAboutContent } from '../controllers/aboutController';
import { protect, authorize } from '../middleware/authMiddleware';

const router = express.Router();

// Public route - Get about content
router.get('/', getAboutContent);

// Admin routes - Update about content
router.put('/', protect, authorize('ADMIN', 'STAFF'), updateAboutContent);

export default router;
