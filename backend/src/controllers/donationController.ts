import { Request, Response } from "express";
import { prisma } from "../../lib/prisma";
import { AppError } from "../middleware/errorHandler";
import { sendDonationThankYou } from "../services/notificationService";
import { geocodeLocation } from "../utils/geocoding";

export const getAllDonations = async (req: Request, res: Response) => {
  const { bloodGroup, donationType, status, userId, donorId, eventId, page = '1', limit = '20' } = req.query;

  // Parse pagination parameters
  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const skip = (pageNum - 1) * limitNum;

  // Build where clause
  const where = {
    ...(bloodGroup && { bloodGroup: bloodGroup as any }),
    ...(donationType && { donationType: donationType as any }),
    ...(status && { status: status as any }),
    ...(userId && { userId: userId as string }),
    ...(donorId && { donorId: donorId as string }),
    ...(eventId && { eventId: eventId as string }),
  };

  // Get total count for pagination
  const total = await prisma.donation.count({ where });

  // Get paginated donations
  const donations = await prisma.donation.findMany({
    where,
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
        },
      },
      bloodPacks: {
        select: {
          id: true,
          packCode: true,
          status: true,
        },
      },
    },
    orderBy: { donationDate: "desc" },
    skip,
    take: limitNum,
  });

  res.json({ 
    status: "success", 
    data: donations,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
    }
  });
};

export const getDonationById = async (req: Request, res: Response) => {
  const { id } = req.params;

  const donation = await prisma.donation.findUnique({
    where: { id: id as string },
    include: {
      user: true,
    },
  });

  if (!donation) {
    throw new AppError("Donation not found", 404);
  }

  res.json({ status: "success", data: donation });
};

export const createDonation = async (req: Request, res: Response) => {
  const {
    userId,
    bloodGroup,
    units,
    location,
    donationType,
    status,
    notes,
    contact,
  } = req.body;

  const donation = await prisma.donation.create({
    data: {
      userId,
      bloodGroup,
      units: units || 1,
      location,
      donationType: donationType || "PERSON",
      status: status || "COMPLETED",
      notes,
      contact,
    },
    include: {
      user: true,
    },
  });

  // Update donor's last donation date and total donations
  const donor = await prisma.donor.findUnique({
    where: { userId },
  });

  if (donor) {
    await prisma.donor.update({
      where: { id: donor.id },
      data: {
        lastDonationDate: new Date(),
        totalDonations: { increment: 1 },
      },
    });
  }

  res.status(201).json({ status: "success", data: donation });
};

export const updateDonation = async (req: Request, res: Response) => {
  const { id } = req.params;
  const updateData = req.body;

  const donation = await prisma.donation.update({
    where: { id: id as string },
    data: updateData,
    include: {
      user: true,
    },
  });

  res.json({ status: "success", data: donation });
};

export const deleteDonation = async (req: Request, res: Response) => {
  const { id } = req.params;

  await prisma.donation.delete({
    where: { id: id as string },
  });

  res.json({ status: "success", message: "Donation deleted successfully" });
};

// Blood Collection - Creates donation record and blood pack
export const recordBloodCollection = async (req: Request, res: Response) => {
  const {
    donorId,
    donorName,
    donorPhone,
    donorEmail,
    bloodGroup,
    dateOfBirth,
    weight,
    location,
    city,
    address,
    latitude, // Add latitude from frontend
    longitude, // Add longitude from frontend
    units,
    collectionDate,
    collectionLocation,
    eventId, // Add eventId from frontend
    storageLocation,
    notes,
    medicalNotes,
  } = req.body;

  // Validate required fields
  if (!donorName || !donorPhone || !bloodGroup || !collectionDate) {
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

  // Start transaction
  const result = await prisma.$transaction(async (tx) => {
    let donor = null;
    let userId = null;

    // If donorId provided, get existing donor
    if (donorId) {
      donor = await tx.donor.findUnique({
        where: { id: donorId },
        include: { user: true },
      });

      if (donor) {
        userId = donor.userId;
        
        // Update donor's donation count and last donation date
        await tx.donor.update({
          where: { id: donorId },
          data: {
            lastDonationDate: new Date(collectionDate),
            totalDonations: { increment: parseInt(units) || 1 },
          },
        });
      }
    }

    // If no donor found, create a temporary user and donor record
    if (!userId) {
      // Check if user with this phone already exists
      let user = await tx.user.findFirst({
        where: { phone: donorPhone },
      });

      if (!user) {
        // Create new user (walk-in donor)
        user = await tx.user.create({
          data: {
            name: donorName,
            phone: donorPhone,
            email: donorEmail || `${donorPhone}@walkin.local`,
            password: 'WALK_IN_DONOR', // Placeholder password
            role: 'DONOR',
            isVerified: false, // Walk-in donors are not verified web users
          },
        });
      }

      userId = user.id;

      // Check if donor profile exists
      donor = await tx.donor.findUnique({
        where: { userId },
      });

      if (!donor) {
        // Geocode coordinates - use provided coordinates or geocode city
        let finalLatitude = latitude;
        let finalLongitude = longitude;
        
        // If coordinates not provided from frontend, try geocoding the city
        if (!finalLatitude || !finalLongitude) {
          const cityToGeocode = city || location;
          if (cityToGeocode) {
            const coords = await geocodeLocation(cityToGeocode);
            if (coords) {
              finalLatitude = coords.latitude;
              finalLongitude = coords.longitude;
              console.log(`Geocoded ${cityToGeocode}:`, coords);
            }
          }
        } else {
          console.log(`Using provided coordinates: ${finalLatitude}, ${finalLongitude}`);
        }

        // Create donor profile
        donor = await tx.donor.create({
          data: {
            userId,
            bloodGroup: dbBloodGroup as any,
            location: location || city || collectionLocation || 'Unknown',
            city: city || location,
            address: address,
            latitude: finalLatitude,
            longitude: finalLongitude,
            dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
            weight: weight ? parseFloat(weight) : undefined,
            medicalNotes: medicalNotes,
            totalDonations: parseInt(units) || 1,
            lastDonationDate: new Date(collectionDate),
          },
        });
      } else {
        // Update existing donor - use provided coordinates or geocode if needed
        const updateData: any = {
          lastDonationDate: new Date(collectionDate),
          totalDonations: { increment: parseInt(units) || 1 },
        };

        if (city) updateData.city = city;
        if (address) updateData.address = address;
        if (dateOfBirth) updateData.dateOfBirth = new Date(dateOfBirth);
        if (weight) updateData.weight = parseFloat(weight);
        if (medicalNotes) updateData.medicalNotes = medicalNotes;

        // Use provided coordinates or geocode if city provided and donor doesn't have coordinates
        if (latitude && longitude) {
          updateData.latitude = latitude;
          updateData.longitude = longitude;
          console.log(`Using provided coordinates for existing donor: ${latitude}, ${longitude}`);
        } else if (city && (!donor.latitude || !donor.longitude)) {
          const coords = await geocodeLocation(city);
          if (coords) {
            updateData.latitude = coords.latitude;
            updateData.longitude = coords.longitude;
            console.log(`Geocoded ${city} for existing donor:`, coords);
          }
        }

        await tx.donor.update({
          where: { id: donor.id },
          data: updateData,
        });
      }
    }

    // ✅ Enforce 90-day donation cooldown for registered (verified) users
    if (userId && donor) {
      // Only enforce cooldown for PERSON donors (not organizations)
      if (donor.donorType !== 'ORGANIZATION' && donor.lastDonationDate) {
        const nextEligibleDate = new Date(donor.lastDonationDate);
        nextEligibleDate.setDate(nextEligibleDate.getDate() + 90);
        const now = new Date();

        if (now < nextEligibleDate) {
          const msRemaining = nextEligibleDate.getTime() - now.getTime();
          const daysRemaining = Math.ceil(msRemaining / (1000 * 60 * 60 * 24));
          throw new AppError(
            `This donor is not eligible to donate yet. They can donate again in ${daysRemaining} day(s) on ${nextEligibleDate.toLocaleDateString()}.`,
            400
          );
        }
      }
    }

    // Create donation record
    const donation = await tx.donation.create({
      data: {
        userId,
        donorId: donor?.id,
        eventId: eventId || undefined, // Link to event if provided
        bloodGroup: dbBloodGroup as any,
        units: parseInt(units) || 1,
        donationDate: new Date(collectionDate),
        location: collectionLocation,
        donationType: 'PERSON',
        status: 'COMPLETED',
        notes,
        contact: donorPhone,
        storageLocation: storageLocation || 'Main Storage', // Add storage location
      },
    });

    // Generate blood pack code (BP-YYYY-NNN)
    const year = new Date(collectionDate).getFullYear();
    const lastPack = await tx.bloodPack.findFirst({
      where: {
        packCode: {
          startsWith: `BP-${year}-`,
        },
      },
      orderBy: { packCode: 'desc' },
    });

    let packNumber = 1;
    if (lastPack) {
      const lastNumber = parseInt(lastPack.packCode.split('-')[2]);
      packNumber = lastNumber + 1;
    }

    const packCode = `BP-${year}-${packNumber.toString().padStart(3, '0')}`;

    // Calculate expiry date (collection date + 35 days)
    const expiryDate = new Date(collectionDate);
    expiryDate.setDate(expiryDate.getDate() + 35);

    // Create blood pack
    const bloodPack = await tx.bloodPack.create({
      data: {
        packCode,
        bloodGroup: dbBloodGroup as any,
        donorId: donor?.id,
        donationId: donation.id, // Link to the donation
        collectionDate: new Date(collectionDate),
        expiryDate,
        status: 'AVAILABLE',
        storageLocation: storageLocation || 'Main Storage',
      },
    });

    // Update blood stock summary
    const stockSummary = await tx.bloodStockSummary.findUnique({
      where: { bloodGroup: dbBloodGroup as any },
    });

    if (stockSummary) {
      await tx.bloodStockSummary.update({
        where: { bloodGroup: dbBloodGroup as any },
        data: {
          available: { increment: parseInt(units) || 1 },
          total: { increment: parseInt(units) || 1 },
          lastUpdated: new Date(),
        },
      });
    } else {
      await tx.bloodStockSummary.create({
        data: {
          bloodGroup: dbBloodGroup as any,
          available: parseInt(units) || 1,
          total: parseInt(units) || 1,
          used: 0,
          expired: 0,
          lastUpdated: new Date(),
        },
      });
    }

    return { donation, bloodPack, donor };
  });

  // Send thank you notification
  try {
    const donorUser = await prisma.user.findUnique({
      where: { id: result.donor?.userId },
    });
    
    if (donorUser) {
      await sendDonationThankYou({
        name: donorUser.name,
        phone: donorUser.phone,
        email: donorUser.email,
        isVerified: donorUser.isVerified,
      });
    }
  } catch (notifError) {
    console.error('Failed to send notification:', notifError);
    // Don't fail the request if notification fails
  }

  res.status(201).json({
    status: "success",
    message: "Blood collection recorded successfully",
    data: result,
  });
};

// Search donors by name, phone, or email
export const searchDonors = async (req: Request, res: Response) => {
  const { query } = req.query;

  if (!query || typeof query !== 'string') {
    throw new AppError("Search query is required", 400);
  }

  const donors = await prisma.donor.findMany({
    where: {
      OR: [
        {
          user: {
            name: {
              contains: query,
              mode: 'insensitive',
            },
          },
        },
        {
          user: {
            phone: {
              contains: query,
            },
          },
        },
        {
          user: {
            email: {
              contains: query,
              mode: 'insensitive',
            },
          },
        },
      ],
    },
    include: {
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
    take: 10, // Limit results
    orderBy: { totalDonations: 'desc' },
  });

  res.json({ status: "success", data: donors });
};

// Search organizations by name or email for bulk collections
export const searchOrganizations = async (req: Request, res: Response) => {
  const { query } = req.query;

  if (!query || typeof query !== 'string') {
    throw new AppError("Search query is required", 400);
  }

  // Find donations from organizations that match the search query
  const orgDonations = await prisma.donation.findMany({
    where: {
      donationType: 'ORGANIZATION',
      OR: [
        {
          user: {
            name: {
              contains: query,
              mode: 'insensitive',
            },
          },
        },
        {
          user: {
            email: {
              contains: query,
              mode: 'insensitive',
            },
          },
        },
        {
          contact: {
            contains: query,
          },
        },
      ],
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
        },
      },
    },
    orderBy: { donationDate: 'desc' },
    take: 20,
  });

  // Group by organization and aggregate data
  const organizationMap = new Map<string, any>();

  for (const donation of orgDonations) {
    const orgKey = donation.user.phone; // Use phone as unique key
    
    if (!organizationMap.has(orgKey)) {
      // Extract contact person name from notes (format: "Bulk collection from ORG - Contact: NAME")
      let contactPersonName = '';
      if (donation.notes) {
        const match = donation.notes.match(/Contact:\s*(.+)/);
        if (match) {
          contactPersonName = match[1].trim();
        }
      }

      // Get donor details separately if needed
      let organizationCity = donation.location || '';
      let organizationAddress = '';
      
      if (donation.donorId) {
        const donor = await prisma.donor.findUnique({
          where: { id: donation.donorId },
          select: { city: true, address: true },
        });
        
        if (donor) {
          organizationCity = donor.city || donation.location || '';
          organizationAddress = donor.address || '';
        }
      }

      organizationMap.set(orgKey, {
        organizationName: donation.user.name,
        organizationEmail: donation.user.email,
        organizationPhone: donation.user.phone,
        organizationCity,
        organizationAddress,
        contactPersonName: contactPersonName,
        lastCollectionDate: donation.donationDate,
        totalCollections: 1,
      });
    } else {
      // Update existing entry
      const existing = organizationMap.get(orgKey);
      existing.totalCollections += 1;
      
      // Keep the most recent collection date
      if (new Date(donation.donationDate) > new Date(existing.lastCollectionDate)) {
        existing.lastCollectionDate = donation.donationDate;
        
        // Update contact person name if available in more recent donation
        if (donation.notes) {
          const match = donation.notes.match(/Contact:\s*(.+)/);
          if (match) {
            existing.contactPersonName = match[1].trim();
          }
        }
      }
    }
  }

  // Convert map to array
  const organizations = Array.from(organizationMap.values());

  res.json({ status: "success", data: organizations });
};

// Bulk blood collection from organizations
export const recordBulkCollection = async (req: Request, res: Response) => {
  const {
    organizationName,
    contactPersonName,
    organizationCity,
    organizationAddress,
    organizationEmail,
    organizationPhone,
    latitude, // Add latitude from frontend
    longitude, // Add longitude from frontend
    collectionDate,
    bloodItems, // Array of { bloodGroup, quantity }
  } = req.body;

  console.log('Received bulk collection request:', {
    organizationName,
    contactPersonName,
    organizationCity,
    organizationAddress,
    organizationPhone,
    collectionDate,
    bloodItems
  });

  // Validate required fields
  if (!organizationName || !contactPersonName || !organizationCity || !organizationAddress || !organizationPhone || !collectionDate || !bloodItems || bloodItems.length === 0) {
    throw new AppError("Missing required fields", 400);
  }

  // Validate blood items
  for (const item of bloodItems) {
    if (!item.bloodGroup || !item.quantity || item.quantity < 1) {
      throw new AppError("Invalid blood item data", 400);
    }
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

  try {
    // Create a user record for the organization contact person (if not exists)
    let orgUser = await prisma.user.findFirst({
      where: { phone: organizationPhone },
    });

    if (!orgUser) {
      console.log('Creating new organization user');
      orgUser = await prisma.user.create({
        data: {
          name: organizationName, // Use organization name as donor name for bulk orders
          phone: organizationPhone,
          email: organizationEmail || `${organizationPhone}@org.local`,
          password: 'ORGANIZATION', // Placeholder
          role: 'DONOR',
          isVerified: false,
        },
      });
    } else {
      // Update existing user with organization name if different
      if (orgUser.name !== organizationName) {
        orgUser = await prisma.user.update({
          where: { id: orgUser.id },
          data: { name: organizationName },
        });
      }
    }

    console.log('Organization user:', orgUser.id, 'Name:', orgUser.name);

    // Create or get donor profile for the organization
    let orgDonor = await prisma.donor.findUnique({
      where: { userId: orgUser.id },
    });

    if (!orgDonor) {
      console.log('Creating donor profile for organization');
      // Use the first blood group from items as default
      const firstBloodGroup = bloodGroupMap[bloodItems[0].bloodGroup] || bloodItems[0].bloodGroup;
      
      // Use provided coordinates or geocode organization city
      let finalLatitude = latitude;
      let finalLongitude = longitude;
      
      // If coordinates not provided from frontend, try geocoding the city
      if (!finalLatitude || !finalLongitude) {
        if (organizationCity) {
          const coords = await geocodeLocation(organizationCity);
          if (coords) {
            finalLatitude = coords.latitude;
            finalLongitude = coords.longitude;
            console.log(`Geocoded organization city ${organizationCity}:`, coords);
          }
        }
      } else {
        console.log(`Using provided coordinates for organization: ${finalLatitude}, ${finalLongitude}`);
      }
      
      orgDonor = await prisma.donor.create({
        data: {
          userId: orgUser.id,
          bloodGroup: firstBloodGroup as any,
          donorType: 'ORGANIZATION', // Set donor type to ORGANIZATION
          location: organizationCity,
          city: organizationCity,
          address: organizationAddress,
          latitude: finalLatitude,
          longitude: finalLongitude,
          totalDonations: 0,
          isEligible: true,
        },
      });
    }

    console.log('Organization donor:', orgDonor.id);

    // Get the current highest pack number for this year
    const year = new Date(collectionDate).getFullYear();
    const lastPack = await prisma.bloodPack.findFirst({
      where: {
        packCode: {
          startsWith: `BP-${year}-`,
        },
      },
      orderBy: { packCode: 'desc' },
    });

    let currentPackNumber = 1;
    if (lastPack) {
      const lastNumber = parseInt(lastPack.packCode.split('-')[2]);
      currentPackNumber = lastNumber + 1;
    }

    console.log('Starting pack number:', currentPackNumber);

    const createdDonations = [];
    const createdBloodPacks = [];

    // Process each blood item
    for (const item of bloodItems) {
      const dbBloodGroup = bloodGroupMap[item.bloodGroup] || item.bloodGroup;
      const quantity = parseInt(item.quantity.toString()) || 1;

      console.log(`Processing ${quantity} units of ${dbBloodGroup}`);

      // Validate blood group
      if (!['A_POSITIVE', 'A_NEGATIVE', 'B_POSITIVE', 'B_NEGATIVE', 'AB_POSITIVE', 'AB_NEGATIVE', 'O_POSITIVE', 'O_NEGATIVE'].includes(dbBloodGroup)) {
        throw new AppError(`Invalid blood group: ${item.bloodGroup}`, 400);
      }

      // Create donation record
      const donation = await prisma.donation.create({
        data: {
          userId: orgUser.id,
          donorId: orgDonor.id, // Link to donor profile
          bloodGroup: dbBloodGroup as any,
          units: quantity,
          donationDate: new Date(collectionDate),
          location: organizationCity,
          donationType: 'ORGANIZATION',
          status: 'COMPLETED',
          notes: `Bulk collection from ${organizationName} - Contact: ${contactPersonName}`,
          contact: organizationPhone,
          storageLocation: 'ORGANIZATION_DONOR', // Set storage location for bulk collections
        },
      });

      createdDonations.push(donation);
      console.log('Created donation:', donation.id);

      // Calculate expiry date once (collection date + 35 days)
      const expiryDate = new Date(collectionDate);
      expiryDate.setDate(expiryDate.getDate() + 35);

      // Create blood packs for each unit
      for (let i = 0; i < quantity; i++) {
        const packCode = `BP-${year}-${currentPackNumber.toString().padStart(3, '0')}`;
        
        console.log('Creating blood pack:', packCode);

        // Create blood pack with donor link and ORGANIZATION_DONOR storage location
        const bloodPack = await prisma.bloodPack.create({
          data: {
            packCode,
            bloodGroup: dbBloodGroup as any,
            donorId: orgDonor.id, // Link to donor profile
            donationId: donation.id, // Link to the donation
            collectionDate: new Date(collectionDate),
            expiryDate,
            status: 'AVAILABLE',
            storageLocation: 'ORGANIZATION_DONOR', // Set as Organization Donor
          },
        });

        createdBloodPacks.push(bloodPack);
        currentPackNumber++; // Increment for next pack
      }

      // Update donor's total donations
      await prisma.donor.update({
        where: { id: orgDonor.id },
        data: {
          totalDonations: { increment: quantity },
          lastDonationDate: new Date(collectionDate),
        },
      });

      // Update blood stock summary
      const stockSummary = await prisma.bloodStockSummary.findUnique({
        where: { bloodGroup: dbBloodGroup as any },
      });

      if (stockSummary) {
        await prisma.bloodStockSummary.update({
          where: { bloodGroup: dbBloodGroup as any },
          data: {
            available: { increment: quantity },
            total: { increment: quantity },
            lastUpdated: new Date(),
          },
        });
        console.log('Updated stock summary for', dbBloodGroup);
      } else {
        await prisma.bloodStockSummary.create({
          data: {
            bloodGroup: dbBloodGroup as any,
            available: quantity,
            total: quantity,
            used: 0,
            expired: 0,
            lastUpdated: new Date(),
          },
        });
        console.log('Created stock summary for', dbBloodGroup);
      }
    }

    const result = {
      organization: {
        name: organizationName,
        city: organizationCity,
        address: organizationAddress,
        phone: organizationPhone,
        email: organizationEmail,
      },
      donations: createdDonations,
      bloodPacks: createdBloodPacks,
      totalUnits: bloodItems.reduce((sum: number, item: any) => sum + parseInt(item.quantity.toString()), 0),
    };

    console.log('Bulk collection completed successfully');

    res.status(201).json({
      status: "success",
      message: "Bulk blood collection recorded successfully",
      data: result,
    });
  } catch (error: any) {
    console.error('Bulk collection error:', error);
    console.error('Error stack:', error.stack);
    throw new AppError(error.message || "Database operation failed", 500);
  }
};
