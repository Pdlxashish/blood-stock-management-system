import { Request, Response } from "express";
import { prisma } from "../../lib/prisma";
import { AppError } from "../middleware/errorHandler";

// Create blood request (public endpoint)
export const createBloodRequest = async (req: Request, res: Response) => {
  const { name, phone, email, address, bloodGroup, unitsNeeded, urgency, neededBy, notes } = req.body;

  // Validate required fields
  if (!name || !phone || !address || !bloodGroup || !neededBy) {
    throw new AppError("Missing required fields", 400);
  }

  // Convert blood group format (A+ -> A_POSITIVE)
  const bloodGroupMap: Record<string, string> = {
    'A+': 'A_POSITIVE',
    'A-': 'A_NEGATIVE',
    'B+': 'B_POSITIVE',
    'B-': 'B_NEGATIVE',
    'AB+': 'AB_POSITIVE',
    'AB-': 'AB_NEGATIVE',
    'O+': 'O_POSITIVE',
    'O-': 'O_NEGATIVE',
  };

  const dbBloodGroup = bloodGroupMap[bloodGroup] || bloodGroup;

  // Create blood request
  const bloodRequest = await prisma.bloodRequest.create({
    data: {
      name,
      phone,
      email: email || null,
      address,
      bloodGroup: dbBloodGroup as any,
      unitsNeeded: parseInt(unitsNeeded) || 1,
      urgency: urgency || 'NORMAL',
      neededBy: new Date(neededBy),
      notes: notes || null,
      status: 'PENDING',
    },
  });

  res.status(201).json({
    status: "success",
    message: "Blood request submitted successfully. Our team will review it shortly.",
    data: bloodRequest,
  });
};

// Get all blood requests (admin)
export const getAllBloodRequests = async (req: Request, res: Response) => {
  const { status, bloodGroup, urgency, page = '1', limit = '20' } = req.query;

  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const skip = (pageNum - 1) * limitNum;

  const where = {
    ...(status && { status: status as any }),
    ...(bloodGroup && { bloodGroup: bloodGroup as any }),
    ...(urgency && { urgency: urgency as any }),
  };

  const total = await prisma.bloodRequest.count({ where });

  const bloodRequests = await prisma.bloodRequest.findMany({
    where,
    orderBy: [
      { urgency: 'desc' }, // Emergency first
      { neededBy: 'asc' }, // Earliest needed first
      { createdAt: 'desc' },
    ],
    skip,
    take: limitNum,
  });

  res.json({
    status: "success",
    data: bloodRequests,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
    },
  });
};

// Get single blood request
export const getBloodRequestById = async (req: Request, res: Response) => {
  const { id } = req.params;

  const bloodRequest = await prisma.bloodRequest.findUnique({
    where: { id: id as string },
    include: {
      bloodIssue: true,
    },
  });

  if (!bloodRequest) {
    throw new AppError("Blood request not found", 404);
  }

  res.json({ status: "success", data: bloodRequest });
};

// Check stock availability for blood request
export const checkStockAvailability = async (req: Request, res: Response) => {
  const { id } = req.params;

  const bloodRequest = await prisma.bloodRequest.findUnique({
    where: { id: id as string },
  });

  if (!bloodRequest) {
    throw new AppError("Blood request not found", 404);
  }

  // Check blood stock
  const stockSummary = await prisma.bloodStockSummary.findUnique({
    where: { bloodGroup: bloodRequest.bloodGroup as any },
  });

  const available = stockSummary ? stockSummary.available : 0;
  const isAvailable = available >= bloodRequest.unitsNeeded;

  // Update blood request with stock check
  const updatedRequest = await prisma.bloodRequest.update({
    where: { id: id as string },
    data: {
      stockAvailable: isAvailable,
      stockCheckedAt: new Date(),
    },
  });

  res.json({
    status: "success",
    data: {
      bloodRequest: updatedRequest,
      stockInfo: {
        available,
        needed: bloodRequest.unitsNeeded,
        isAvailable,
      },
    },
  });
};

// Approve blood request
export const approveBloodRequest = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { reviewedBy } = req.body;

  const bloodRequest = await prisma.bloodRequest.findUnique({
    where: { id: id as string },
  });

  if (!bloodRequest) {
    throw new AppError("Blood request not found", 404);
  }

  if (bloodRequest.status !== 'PENDING') {
    throw new AppError("Only pending requests can be approved", 400);
  }

  // Check stock availability
  const stockSummary = await prisma.bloodStockSummary.findUnique({
    where: { bloodGroup: bloodRequest.bloodGroup as any },
  });

  const available = stockSummary ? stockSummary.available : 0;
  const isAvailable = available >= bloodRequest.unitsNeeded;

  if (!isAvailable) {
    throw new AppError(`Insufficient stock. Available: ${available}, Needed: ${bloodRequest.unitsNeeded}`, 400);
  }

  // Approve request
  const updatedRequest = await prisma.bloodRequest.update({
    where: { id: id as string },
    data: {
      status: 'APPROVED',
      reviewedBy: reviewedBy || null,
      reviewedAt: new Date(),
      approvedAt: new Date(),
      stockAvailable: true,
      stockCheckedAt: new Date(),
    },
  });

  res.json({
    status: "success",
    message: "Blood request approved successfully",
    data: updatedRequest,
  });
};

// Reject blood request
export const rejectBloodRequest = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { reviewedBy, rejectionReason } = req.body;

  if (!rejectionReason) {
    throw new AppError("Rejection reason is required", 400);
  }

  const bloodRequest = await prisma.bloodRequest.findUnique({
    where: { id: id as string },
  });

  if (!bloodRequest) {
    throw new AppError("Blood request not found", 404);
  }

  if (bloodRequest.status !== 'PENDING') {
    throw new AppError("Only pending requests can be rejected", 400);
  }

  // Reject request
  const updatedRequest = await prisma.bloodRequest.update({
    where: { id: id as string },
    data: {
      status: 'REJECTED',
      reviewedBy: reviewedBy || null,
      reviewedAt: new Date(),
      rejectedAt: new Date(),
      rejectionReason,
    },
  });

  res.json({
    status: "success",
    message: "Blood request rejected",
    data: updatedRequest,
  });
};

// Get pending blood requests count
export const getPendingRequestsCount = async (req: Request, res: Response) => {
  const count = await prisma.bloodRequest.count({
    where: { status: 'PENDING' },
  });

  res.json({
    status: "success",
    data: { count },
  });
};

// Get approved blood requests (for blood donate page)
export const getApprovedBloodRequests = async (req: Request, res: Response) => {
  const bloodRequests = await prisma.bloodRequest.findMany({
    where: {
      status: 'APPROVED',
      fulfilledAt: null, // Not yet fulfilled
    },
    orderBy: [
      { urgency: 'desc' },
      { neededBy: 'asc' },
    ],
    take: 50, // Limit to 50 most urgent
  });

  res.json({
    status: "success",
    data: bloodRequests,
  });
};

// Mark blood request as fulfilled
export const fulfillBloodRequest = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { fulfilledBy, bloodIssueId } = req.body;

  const bloodRequest = await prisma.bloodRequest.findUnique({
    where: { id: id as string },
  });

  if (!bloodRequest) {
    throw new AppError("Blood request not found", 404);
  }

  if (bloodRequest.status !== 'APPROVED') {
    throw new AppError("Only approved requests can be fulfilled", 400);
  }

  // Mark as fulfilled
  const updatedRequest = await prisma.bloodRequest.update({
    where: { id: id as string },
    data: {
      status: 'FULFILLED',
      fulfilledAt: new Date(),
      fulfilledBy: fulfilledBy || null,
      bloodIssueId: bloodIssueId || null,
    },
  });

  res.json({
    status: "success",
    message: "Blood request marked as fulfilled",
    data: updatedRequest,
  });
};
