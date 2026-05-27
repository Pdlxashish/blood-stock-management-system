import { Request, Response } from "express";
import { prisma } from "../../lib/prisma";
import { AppError } from "../middleware/errorHandler";
import { geocodeLocation } from "../utils/geocoding";
import { 
  sendDonorRejectionEmail, 
  sendDonorApprovalEmail,
  sendReverificationRequestEmail,
  sendDonorUnverificationEmail
} from "../utils/emailService";
import { createNotification } from "./notificationController";

export const getAllDonors = async (req: Request, res: Response) => {
  const { bloodGroup, location, isEligible, verificationStatus, userId, page = '1', limit = '20' } = req.query;

  // Parse pagination parameters
  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const skip = (pageNum - 1) * limitNum;

  // Build where clause
  const where = {
    ...(bloodGroup && { bloodGroup: bloodGroup as any }),
    ...(location && { location: { contains: location as string, mode: "insensitive" as const } }),
    ...(isEligible !== undefined && { isEligible: isEligible === "true" }),
    ...(verificationStatus && { verificationStatus: verificationStatus as any }),
    ...(userId && { userId: userId as string }),
  };

  // Get total count for pagination
  const total = await prisma.donor.count({ where });

  // Get paginated donors
  const donors = await prisma.donor.findMany({
    where,
    select: {
      id: true,
      userId: true,
      bloodGroup: true,
      donorType: true, // Explicitly include donorType
      location: true,
      city: true,
      address: true,
      dateOfBirth: true,
      weight: true,
      latitude: true,
      longitude: true,
      lastDonationDate: true,
      totalDonations: true,
      isEligible: true,
      verificationStatus: true,
      verifiedAt: true,
      rejectionReason: true,
      reverificationRequested: true,
      reverificationMessage: true,
      reverificationRequestedAt: true,
      createdAt: true,
      updatedAt: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          isVerified: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
    skip,
    take: limitNum,
  });

  res.json({ 
    status: "success", 
    data: donors,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
    }
  });
};

export const getDonorById = async (req: Request, res: Response) => {
  const { id } = req.params;

  const donor = await prisma.donor.findUnique({
    where: { id: id as string },
    select: {
      id: true,
      userId: true,
      bloodGroup: true,
      donorType: true, // Explicitly include donorType
      location: true,
      city: true,
      address: true,
      dateOfBirth: true,
      weight: true,
      latitude: true,
      longitude: true,
      lastDonationDate: true,
      totalDonations: true,
      isEligible: true,
      verificationStatus: true,
      verifiedAt: true,
      rejectionReason: true,
      createdAt: true,
      updatedAt: true,
      user: true,
      bloodPacks: true,
    },
  });

  if (!donor) {
    throw new AppError("Donor not found", 404);
  }

  res.json({ status: "success", data: donor });
};

export const createDonor = async (req: Request, res: Response) => {
  const { userId, bloodGroup, location, city, address, dateOfBirth, weight, latitude, longitude } = req.body;

  const existingDonor = await prisma.donor.findUnique({
    where: { userId },
  });

  if (existingDonor) {
    throw new AppError("Donor profile already exists for this user", 400);
  }

  // Geocode city if coordinates not provided
  let finalLatitude = latitude;
  let finalLongitude = longitude;

  if (!latitude || !longitude) {
    const cityToGeocode = city || location;
    if (cityToGeocode) {
      const coords = await geocodeLocation(cityToGeocode);
      if (coords) {
        finalLatitude = coords.latitude;
        finalLongitude = coords.longitude;
        console.log(`Geocoded ${cityToGeocode}:`, coords);
      }
    }
  }

  // Create donor profile
  const donor = await prisma.donor.create({
    data: {
      userId,
      bloodGroup,
      donorType: 'PERSON', // Default to PERSON for individual donors
      location,
      city,
      address,
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
      weight,
      latitude: finalLatitude,
      longitude: finalLongitude,
      verificationStatus: 'PENDING', // Set to PENDING by default
    },
    select: {
      id: true,
      userId: true,
      bloodGroup: true,
      donorType: true,
      location: true,
      city: true,
      address: true,
      dateOfBirth: true,
      weight: true,
      latitude: true,
      longitude: true,
      lastDonationDate: true,
      totalDonations: true,
      isEligible: true,
      verificationStatus: true,
      createdAt: true,
      updatedAt: true,
      user: true,
    },
  });

  // DO NOT mark user as verified automatically - wait for admin verification
  // await prisma.user.update({
  //   where: { id: userId },
  //   data: { isVerified: true },
  // });

  res.status(201).json({ 
    status: "success", 
    message: "Donor profile submitted successfully. Your account will be verified by our team shortly.",
    data: donor 
  });
};

export const updateDonor = async (req: Request, res: Response) => {
  const { id } = req.params;
  const updateData = req.body;

  const donor = await prisma.donor.update({
    where: { id: id as string },
    data: updateData,
    select: {
      id: true,
      userId: true,
      bloodGroup: true,
      donorType: true,
      location: true,
      city: true,
      address: true,
      dateOfBirth: true,
      weight: true,
      latitude: true,
      longitude: true,
      lastDonationDate: true,
      totalDonations: true,
      isEligible: true,
      createdAt: true,
      updatedAt: true,
      user: true,
    },
  });

  res.json({ status: "success", data: donor });
};

export const deleteDonor = async (req: Request, res: Response) => {
  const { id } = req.params;

  await prisma.donor.delete({
    where: { id: id as string },
  });

  res.json({ status: "success", message: "Donor deleted successfully" });
};

// Search/Verify donor by ID, email, phone, or name
export const verifyDonor = async (req: Request, res: Response) => {
  const { query } = req.query;

  if (!query || typeof query !== 'string') {
    throw new AppError("Search query is required", 400);
  }

  const searchQuery = query.trim();

  // Try to find donor by:
  // 1. Donor ID (exact match)
  // 2. User email (case-insensitive)
  // 3. User phone (exact match)
  // 4. User name (case-insensitive partial match)
  const donor = await prisma.donor.findFirst({
    where: {
      OR: [
        { id: searchQuery },
        { user: { email: { equals: searchQuery, mode: 'insensitive' } } },
        { user: { phone: searchQuery } },
        { user: { name: { contains: searchQuery, mode: 'insensitive' } } },
      ],
    },
    select: {
      id: true,
      userId: true,
      bloodGroup: true,
      donorType: true,
      location: true,
      city: true,
      address: true,
      dateOfBirth: true,
      weight: true,
      latitude: true,
      longitude: true,
      lastDonationDate: true,
      totalDonations: true,
      isEligible: true,
      medicalNotes: true,
      createdAt: true,
      updatedAt: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          isVerified: true,
        },
      },
    },
  });

  if (!donor) {
    throw new AppError("Donor not found", 404);
  }

  // Calculate days since last donation
  let daysSinceLastDonation = null;
  if (donor.lastDonationDate) {
    const diffTime = Math.abs(new Date().getTime() - new Date(donor.lastDonationDate).getTime());
    daysSinceLastDonation = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  }

  // Determine donor status based on eligibility and recent activity
  let status: 'ACTIVE' | 'INACTIVE' = 'ACTIVE';
  if (!donor.isEligible || (daysSinceLastDonation && daysSinceLastDonation > 365)) {
    status = 'INACTIVE';
  }

  // Determine donor type category
  let donorTypeCategory: 'REGULAR' | 'FIRST_TIME' | 'OCCASIONAL' = 'FIRST_TIME';
  if (donor.totalDonations >= 5) {
    donorTypeCategory = 'REGULAR';
  } else if (donor.totalDonations > 1) {
    donorTypeCategory = 'OCCASIONAL';
  }

  res.json({
    status: "success",
    data: {
      ...donor,
      status,
      donorTypeCategory,
      daysSinceLastDonation,
      livesSaved: donor.totalDonations * 3, // Estimate: 1 donation can save up to 3 lives
    },
  });
};

// Search donors for autocomplete suggestions
export const searchDonors = async (req: Request, res: Response) => {
  const { query } = req.query;

  if (!query || typeof query !== 'string') {
    return res.json({
      status: "success",
      data: [],
    });
  }

  const searchQuery = query.trim();

  // Return empty if query is too short
  if (searchQuery.length < 2) {
    return res.json({
      status: "success",
      data: [],
    });
  }

  // Search for donors matching the query
  const donors = await prisma.donor.findMany({
    where: {
      OR: [
        { id: { contains: searchQuery, mode: 'insensitive' } },
        { user: { name: { contains: searchQuery, mode: 'insensitive' } } },
        { user: { email: { contains: searchQuery, mode: 'insensitive' } } },
        { user: { phone: { contains: searchQuery } } },
      ],
    },
    select: {
      id: true,
      bloodGroup: true,
      user: {
        select: {
          name: true,
          email: true,
          phone: true,
        },
      },
    },
    take: 10, // Limit to 10 suggestions
    orderBy: {
      user: {
        name: 'asc',
      },
    },
  });

  res.json({
    status: "success",
    data: donors,
  });
};

// Get all pending donors for verification
export const getPendingDonors = async (req: Request, res: Response) => {
  const { page = '1', limit = '20' } = req.query;

  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const skip = (pageNum - 1) * limitNum;

  const where = {
    verificationStatus: 'PENDING' as any,
  };

  const total = await prisma.donor.count({ where });

  const donors = await prisma.donor.findMany({
    where,
    select: {
      id: true,
      userId: true,
      bloodGroup: true,
      donorType: true,
      location: true,
      city: true,
      address: true,
      dateOfBirth: true,
      weight: true,
      verificationStatus: true,
      rejectionReason: true,
      reverificationRequested: true,
      reverificationMessage: true,
      reverificationRequestedAt: true,
      createdAt: true,
      updatedAt: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          isVerified: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
    skip,
    take: limitNum,
  });

  res.json({
    status: "success",
    data: donors,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
    }
  });
};

// Verify/Approve a donor
export const approveDonor = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { verifiedBy } = req.body; // User ID of the person verifying

  const donor = await prisma.donor.findUnique({
    where: { id: id as string },
    include: { user: true },
  });

  if (!donor) {
    throw new AppError("Donor not found", 404);
  }

  if (donor.verificationStatus === 'VERIFIED' && !donor.reverificationRequested) {
    throw new AppError("Donor is already verified", 400);
  }

  // Update donor verification status
  const updatedDonor = await prisma.donor.update({
    where: { id: id as string },
    data: {
      verificationStatus: 'VERIFIED',
      verifiedAt: new Date(),
      verifiedBy: verifiedBy || null,
      rejectionReason: null, // Clear any previous rejection reason
      reverificationRequested: false, // Clear re-verification flag
      reverificationMessage: null, // Clear re-verification message
    },
    select: {
      id: true,
      userId: true,
      bloodGroup: true,
      donorType: true,
      location: true,
      city: true,
      address: true,
      dateOfBirth: true,
      weight: true,
      verificationStatus: true,
      verifiedAt: true,
      reverificationRequested: true,
      createdAt: true,
      updatedAt: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          isVerified: true,
        },
      },
    },
  });

  // Also mark the user as verified
  await prisma.user.update({
    where: { id: donor.userId },
    data: { isVerified: true },
  });

  // Send approval email to donor
  try {
    await sendDonorApprovalEmail(donor.user.email, donor.user.name);
    
    // Create notification
    await createNotification(
      donor.userId,
      'VERIFICATION_APPROVED',
      'Verification Approved',
      'Your donor profile has been verified. You can now access all donor features.',
      '/profile'
    );
  } catch (emailError) {
    console.error('Failed to send approval email:', emailError);
    // Continue even if email fails
  }

  res.json({
    status: "success",
    message: donor.reverificationRequested 
      ? "Donor re-verified successfully. Approval email sent." 
      : "Donor verified successfully. Approval email sent.",
    data: updatedDonor,
  });
};

// Reject a donor
export const rejectDonor = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { rejectionReason, verifiedBy } = req.body;

  if (!rejectionReason) {
    throw new AppError("Rejection reason is required", 400);
  }

  const donor = await prisma.donor.findUnique({
    where: { id: id as string },
    include: { user: true },
  });

  if (!donor) {
    throw new AppError("Donor not found", 404);
  }

  // Update donor verification status
  const updatedDonor = await prisma.donor.update({
    where: { id: id as string },
    data: {
      verificationStatus: 'REJECTED',
      verifiedAt: new Date(),
      verifiedBy: verifiedBy || null,
      rejectionReason,
      reverificationRequested: false, // Clear re-verification flag if rejecting again
      reverificationMessage: null, // Clear re-verification message
    },
    select: {
      id: true,
      userId: true,
      bloodGroup: true,
      donorType: true,
      location: true,
      verificationStatus: true,
      verifiedAt: true,
      rejectionReason: true,
      reverificationRequested: true,
      createdAt: true,
      updatedAt: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
        },
      },
    },
  });

  // Send rejection email to donor
  try {
    await sendDonorRejectionEmail(donor.user.email, donor.user.name, rejectionReason);
    
    // Create notification
    await createNotification(
      donor.userId,
      'VERIFICATION_REJECTED',
      'Verification Rejected',
      `Your donor profile verification was rejected. Reason: ${rejectionReason}`,
      '/profile'
    );
  } catch (emailError) {
    console.error('Failed to send rejection email:', emailError);
    // Continue even if email fails
  }

  res.json({
    status: "success",
    message: "Donor rejected. Rejection email sent to donor.",
    data: updatedDonor,
  });
};

// Get verification statistics
export const getVerificationStats = async (req: Request, res: Response) => {
  const [pending, verified, rejected, total] = await Promise.all([
    prisma.donor.count({ where: { verificationStatus: 'PENDING' } }),
    prisma.donor.count({ where: { verificationStatus: 'VERIFIED' } }),
    prisma.donor.count({ where: { verificationStatus: 'REJECTED' } }),
    prisma.donor.count(),
  ]);

  res.json({
    status: "success",
    data: {
      pending,
      verified,
      rejected,
      total,
    },
  });
};

// Request re-verification (for rejected donors)
export const requestReverification = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { reverificationMessage } = req.body;

  const donor = await prisma.donor.findUnique({
    where: { id: id as string },
    include: { user: true },
  });

  if (!donor) {
    throw new AppError("Donor not found", 404);
  }

  if (donor.verificationStatus !== 'REJECTED') {
    throw new AppError("Only rejected donors can request re-verification", 400);
  }

  if (donor.reverificationRequested) {
    throw new AppError("Re-verification already requested", 400);
  }

  // Update donor to request re-verification
  const updatedDonor = await prisma.donor.update({
    where: { id: id as string },
    data: {
      reverificationRequested: true,
      reverificationMessage: reverificationMessage || null,
      reverificationRequestedAt: new Date(),
    },
    select: {
      id: true,
      userId: true,
      bloodGroup: true,
      verificationStatus: true,
      reverificationRequested: true,
      reverificationMessage: true,
      reverificationRequestedAt: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  // Send notification to admin (you can configure admin email in .env)
  const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_USER;
  if (adminEmail) {
    try {
      await sendReverificationRequestEmail(
        adminEmail,
        donor.user.name,
        donor.user.email,
        reverificationMessage
      );
    } catch (emailError) {
      console.error('Failed to send re-verification notification to admin:', emailError);
      // Continue even if email fails
    }
  }

  res.json({
    status: "success",
    message: "Re-verification request submitted successfully. Our team will review your profile again.",
    data: updatedDonor,
  });
};

// Get donor by user ID (for user profile)
export const getDonorByUserId = async (req: Request, res: Response) => {
  const { userId } = req.params;

  const donor = await prisma.donor.findUnique({
    where: { userId: userId as string },
    select: {
      id: true,
      userId: true,
      bloodGroup: true,
      donorType: true,
      location: true,
      city: true,
      address: true,
      dateOfBirth: true,
      weight: true,
      latitude: true,
      longitude: true,
      lastDonationDate: true,
      totalDonations: true,
      isEligible: true,
      verificationStatus: true,
      verifiedAt: true,
      rejectionReason: true,
      reverificationRequested: true,
      reverificationMessage: true,
      reverificationRequestedAt: true,
      createdAt: true,
      updatedAt: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          isVerified: true,
        },
      },
    },
  });

  if (!donor) {
    throw new AppError("Donor profile not found", 404);
  }

  res.json({ status: "success", data: donor });
};

// Unverify a donor (change from VERIFIED to PENDING/REJECTED)
export const unverifyDonor = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { unverificationReason, verifiedBy } = req.body;

  if (!unverificationReason) {
    throw new AppError("Unverification reason is required", 400);
  }

  const donor = await prisma.donor.findUnique({
    where: { id: id as string },
    include: { user: true },
  });

  if (!donor) {
    throw new AppError("Donor not found", 404);
  }

  if (donor.verificationStatus !== 'VERIFIED') {
    throw new AppError("Only verified donors can be unverified", 400);
  }

  // Update donor verification status to REJECTED with reason
  const updatedDonor = await prisma.donor.update({
    where: { id: id as string },
    data: {
      verificationStatus: 'REJECTED',
      verifiedAt: new Date(),
      verifiedBy: verifiedBy || null,
      rejectionReason: unverificationReason,
      reverificationRequested: false,
      reverificationMessage: null,
    },
    select: {
      id: true,
      userId: true,
      bloodGroup: true,
      donorType: true,
      location: true,
      verificationStatus: true,
      verifiedAt: true,
      rejectionReason: true,
      reverificationRequested: true,
      createdAt: true,
      updatedAt: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
        },
      },
    },
  });

  // Also mark the user as unverified
  await prisma.user.update({
    where: { id: donor.userId },
    data: { isVerified: false },
  });

  // Send unverification email to donor
  try {
    await sendDonorUnverificationEmail(donor.user.email, donor.user.name, unverificationReason);
    
    // Create notification
    await createNotification(
      donor.userId,
      'VERIFICATION_UNVERIFIED',
      'Verification Status Changed',
      `Your donor verification status has been changed. Reason: ${unverificationReason}`,
      '/profile'
    );
  } catch (emailError) {
    console.error('Failed to send unverification email:', emailError);
    // Continue even if email fails
  }

  res.json({
    status: "success",
    message: "Donor unverified successfully. Notification email sent to donor.",
    data: updatedDonor,
  });
};
