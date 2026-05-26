import { Router } from "express";
import { asyncHandler } from "../middleware/asyncHandler";
import * as donorController from "../controllers/donorController";

const router = Router();

router.get("/", asyncHandler(donorController.getAllDonors));
router.get("/pending", asyncHandler(donorController.getPendingDonors));
router.get("/verification-stats", asyncHandler(donorController.getVerificationStats));
router.get("/verify", asyncHandler(donorController.verifyDonor));
router.get("/search", asyncHandler(donorController.searchDonors));
router.get("/:id", asyncHandler(donorController.getDonorById));
router.post("/", asyncHandler(donorController.createDonor));
router.put("/:id", asyncHandler(donorController.updateDonor));
router.patch("/:id/approve", asyncHandler(donorController.approveDonor));
router.patch("/:id/reject", asyncHandler(donorController.rejectDonor));
router.delete("/:id", asyncHandler(donorController.deleteDonor));

export default router;
