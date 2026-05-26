import express from 'express';
import {
  getAllGalleryImages,
  getGalleryImage,
  createGalleryImage,
  updateGalleryImage,
  deleteGalleryImage,
  reorderGalleryImages,
  upload
} from '../controllers/galleryController';
import { protect, authorize } from '../middleware/authMiddleware';

const router = express.Router();

// Public routes
router.get('/', getAllGalleryImages);
router.get('/:id', getGalleryImage);

// Protected routes (Admin only)
router.post('/', protect, authorize('ADMIN', 'STAFF'), upload.single('image'), createGalleryImage);
router.put('/reorder', protect, authorize('ADMIN', 'STAFF'), reorderGalleryImages);
router.put('/:id', protect, authorize('ADMIN', 'STAFF'), upload.single('image'), updateGalleryImage);
router.delete('/:id', protect, authorize('ADMIN', 'STAFF'), deleteGalleryImage);

export default router;
