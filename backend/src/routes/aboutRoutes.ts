import express from 'express';
import { getAboutContent, updateAboutContent, updateWhatsAppSettings } from '../controllers/aboutController';
import { protect, authorize } from '../middleware/authMiddleware';

const router = express.Router();

// Public route - Get about content
router.get('/', getAboutContent);

// Admin routes - Update about content
router.put('/', protect, authorize('ADMIN', 'STAFF'), updateAboutContent);

// Admin route - Update WhatsApp settings only
router.patch('/whatsapp', protect, authorize('ADMIN'), updateWhatsAppSettings);

export default router;
