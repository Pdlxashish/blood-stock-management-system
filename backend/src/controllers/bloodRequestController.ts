import { Request, Response } from "express";
import { prisma } from "../../lib/prisma";
import { AppError } from "../middleware/errorHandler";
import { sendBloodRequestApprovalEmail, sendBloodRequestRejectionEmail, sendBloodRequestFulfillmentEmail } from "../utils/emailService";

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
  const requestedUnits = parseInt(unitsNeeded) || 1;

  // Check blood stock availability
  const stockSummary = await prisma.bloodStockSummary.findUnique({
    where: { bloodGroup: dbBloodGroup as any },
  });

  const available = stockSummary ? stockSummary.available : 0;
  const isAvailable = available >= requestedUnits;

  // If stock is not available, auto-reject and send email
  if (!isAvailable) {
    const bloodRequest = await prisma.bloodRequest.create({
      data: {
        name,
        phone,
        email: email || null,
        address,
        bloodGroup: dbBloodGroup as any,
        unitsNeeded: requestedUnits,
        urgency: urgency || 'NORMAL',
        neededBy: new Date(neededBy),
        notes: notes || null,
        status: 'REJECTED',
        stockAvailable: false,
        stockCheckedAt: new Date(),
        reviewedAt: new Date(),
        rejectedAt: new Date(),
        rejectionReason: `Insufficient stock. Available: ${available} unit(s), Requested: ${requestedUnits} unit(s). Please try again later or contact other blood banks.`,
      },
    });

    // Send rejection email if email is provided
    if (email) {
      try {
        const bloodGroupDisplay = bloodGroup; // Use original format (A+, B-, etc.)
        await sendBloodRequestRejectionEmail(
          email,
          name,
          bloodGroupDisplay,
          requestedUnits,
          `Insufficient stock. We currently have ${available} unit(s) available, but you requested ${requestedUnits} unit(s).`
        );
        console.log(`✅ Auto-rejection email sent to ${email}`);
      } catch (emailError) {
        console.error('❌ Failed to send rejection email:', emailError);
      }
    }

    return res.status(200).json({
      status: "rejected",
      message: `We're sorry, but we don't have sufficient ${bloodGroup} blood in stock. Your request has been recorded and we'll notify you when stock becomes available.`,
      data: bloodRequest,
    });
  }

  // Create blood request with pending status if stock is available
  const bloodRequest = await prisma.bloodRequest.create({
    data: {
      name,
      phone,
      email: email || null,
      address,
      bloodGroup: dbBloodGroup as any,
      unitsNeeded: requestedUnits,
      urgency: urgency || 'NORMAL',
      neededBy: new Date(neededBy),
      notes: notes || null,
      status: 'PENDING',
      stockAvailable: true,
      stockCheckedAt: new Date(),
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

  // Send approval email if email is provided
  if (updatedRequest.email) {
    try {
      // Convert blood group back to readable format (A_POSITIVE -> A+)
      const bloodGroupDisplay = updatedRequest.bloodGroup
        .replace('_POSITIVE', '+')
        .replace('_NEGATIVE', '-');
      
      await sendBloodRequestApprovalEmail(
        updatedRequest.email,
        updatedRequest.name,
        bloodGroupDisplay,
        updatedRequest.unitsNeeded
      );
      console.log(`✅ Approval email sent to ${updatedRequest.email}`);
    } catch (emailError) {
      console.error('❌ Failed to send approval email:', emailError);
      // Don't fail the approval if email fails
    }
  }

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

  // Send rejection email if email is provided
  if (updatedRequest.email) {
    try {
      // Convert blood group back to readable format (A_POSITIVE -> A+)
      const bloodGroupDisplay = updatedRequest.bloodGroup
        .replace('_POSITIVE', '+')
        .replace('_NEGATIVE', '-');
      
      await sendBloodRequestRejectionEmail(
        updatedRequest.email,
        updatedRequest.name,
        bloodGroupDisplay,
        updatedRequest.unitsNeeded,
        rejectionReason
      );
      console.log(`✅ Rejection email sent to ${updatedRequest.email}`);
    } catch (emailError) {
      console.error('❌ Failed to send rejection email:', emailError);
      // Don't fail the rejection if email fails
    }
  }

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
      { createdAt: 'desc' }, // LIFO - most recent first
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

  // Send fulfillment email if email is provided
  if (updatedRequest.email) {
    try {
      // Convert blood group back to readable format (A_POSITIVE -> A+)
      const bloodGroupDisplay = updatedRequest.bloodGroup
        .replace('_POSITIVE', '+')
        .replace('_NEGATIVE', '-');
      
      await sendBloodRequestFulfillmentEmail(
        updatedRequest.email,
        updatedRequest.name,
        bloodGroupDisplay,
        updatedRequest.unitsNeeded
      );
      console.log(`✅ Fulfillment email sent to ${updatedRequest.email}`);
    } catch (emailError) {
      console.error('❌ Failed to send fulfillment email:', emailError);
      // Don't fail the fulfillment if email fails
    }
  }

  res.json({
    status: "success",
    message: "Blood request marked as fulfilled",
    data: updatedRequest,
  });
};
