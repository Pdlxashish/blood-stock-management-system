import { Router } from 'express';
import { checkEmailExists } from '../controllers/emailVerificationController';

const router = Router();

// Check if email exists and return associated accounts
router.get('/check', checkEmailExists);

export default router;
