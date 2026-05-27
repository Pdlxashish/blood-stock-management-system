import { Router } from "express";
import { asyncHandler } from "../middleware/asyncHandler";
import * as bloodRequestController from "../controllers/bloodRequestController";

const router = Router();

// Public endpoint - create blood request
router.post("/", asyncHandler(bloodRequestController.createBloodRequest));

// Admin endpoints
router.get("/", asyncHandler(bloodRequestController.getAllBloodRequests));
router.get("/pending/count", asyncHandler(bloodRequestController.getPendingRequestsCount));
router.get("/approved", asyncHandler(bloodRequestController.getApprovedBloodRequests));
router.get("/:id", asyncHandler(bloodRequestController.getBloodRequestById));
router.post("/:id/check-stock", asyncHandler(bloodRequestController.checkStockAvailability));
router.patch("/:id/approve", asyncHandler(bloodRequestController.approveBloodRequest));
router.patch("/:id/reject", asyncHandler(bloodRequestController.rejectBloodRequest));
router.patch("/:id/fulfill", asyncHandler(bloodRequestController.fulfillBloodRequest));

export default router;
