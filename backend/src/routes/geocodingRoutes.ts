import express from 'express';
import { forwardGeocode, reverseGeocode } from '../controllers/geocodingController';

const router = express.Router();

// Forward geocoding: address/city -> coordinates
router.get('/forward', forwardGeocode);

// Reverse geocoding: coordinates -> address
router.get('/reverse', reverseGeocode);

export default router;
