import express from 'express';
import {
  requestPasswordReset,
  resetPassword,
} from '../controllers/passwordResetController';

const router = express.Router();

// Request password reset (send OTP)
router.post('/request', requestPasswordReset);

// Reset password with OTP
router.post('/reset', resetPassword);

export default router;
