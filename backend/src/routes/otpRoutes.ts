import { Router } from 'express';
import { asyncHandler } from '../middleware/asyncHandler';
import * as otpController from '../controllers/otpController';

const router = Router();

router.post('/send', asyncHandler(otpController.sendOTP));
router.post('/verify', asyncHandler(otpController.verifyOTP));
router.post('/resend', asyncHandler(otpController.resendOTP));

export default router;
