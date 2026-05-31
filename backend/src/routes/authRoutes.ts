import { Router } from 'express';
import {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  updateProfilePicture,
  adminLogin,
  googleAuth,
  googleAuthCallback,
  googleAuthFailure,
} from '../controllers/authController';
import { protect } from '../middleware/authMiddleware';
import { upload } from '../middleware/upload';
import passport from '../config/passport';

const router = Router();

// Public Routes
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/admin', adminLogin);

// Google OAuth Routes
router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get(
  '/google/callback',
  passport.authenticate('google', { 
    failureRedirect: '/api/auth/google/failure',
    session: false 
  }),
  googleAuthCallback
);

router.get('/google/failure', googleAuthFailure);

// Handle wrong methods
router.get('/login', (_, res) =>
  res.status(405).json({
    success: false,
    message: 'Use POST /api/auth/login',
  })
);

router.get('/register', (_, res) =>
  res.status(405).json({
    success: false,
    message: 'Use POST /api/auth/register',
  })
);

// Protected Routes
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);
router.patch('/profile/picture', protect, upload.single('profilePicture'), updateProfilePicture);

export default router;