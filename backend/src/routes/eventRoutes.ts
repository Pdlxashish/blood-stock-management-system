import { Router } from "express";
import { asyncHandler } from "../middleware/asyncHandler";
import * as eventController from "../controllers/eventController";
import { eventUpload } from "../middleware/upload";

const router = Router();

router.get("/", asyncHandler(eventController.getAllEvents));
router.get("/:id", asyncHandler(eventController.getEventById));
router.post("/", asyncHandler(eventController.createEvent));
router.put("/:id", asyncHandler(eventController.updateEvent));
router.delete("/:id", asyncHandler(eventController.deleteEvent));

// Image uploads
router.patch("/:id/banner", eventUpload.single("banner"), asyncHandler(eventController.uploadEventBanner));
router.patch("/:id/poster", eventUpload.single("poster"), asyncHandler(eventController.uploadEventPoster));

// Location update
router.patch("/:id/location", asyncHandler(eventController.updateEventLocation));

// Participant management
router.post("/:id/participants", asyncHandler(eventController.addParticipant));
router.delete("/:id/participants/:participantId", asyncHandler(eventController.removeParticipant));

// Volunteer management
router.post("/:id/volunteers", asyncHandler(eventController.addVolunteer));
router.delete("/:id/volunteers/:volunteerId", asyncHandler(eventController.removeVolunteer));

export default router;
