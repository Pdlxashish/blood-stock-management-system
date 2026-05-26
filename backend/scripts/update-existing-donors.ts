/**
 * Script to update existing donors to VERIFIED status
 * Run this once after deploying the verification feature
 * 
 * Usage: npx ts-node scripts/update-existing-donors.ts
 */

import { PrismaClient } from '../generated/prisma';

const prisma = new PrismaClient();

async function updateExistingDonors() {
  try {
    console.log('Starting to update existing donors...');

    // Get all donors with PENDING status
    const pendingDonors = await prisma.donor.findMany({
      where: {
        verificationStatus: 'PENDING',
      },
      include: {
        user: true,
      },
    });

    console.log(`Found ${pendingDonors.length} pending donors`);

    // Update all existing donors to VERIFIED
    // (assuming they were legitimate before the verification feature was added)
    const result = await prisma.donor.updateMany({
      where: {
        verificationStatus: 'PENDING',
        // Only update donors created before the verification feature was deployed
        createdAt: {
          lt: new Date('2026-05-25'),
        },
      },
      data: {
        verificationStatus: 'VERIFIED',
        verifiedAt: new Date(),
        verifiedBy: 'system-migration',
      },
    });

    console.log(`Updated ${result.count} donors to VERIFIED status`);

    // Also update the corresponding users to isVerified: true
    const userIds = pendingDonors
      .filter((donor) => donor.createdAt < new Date('2026-05-25'))
      .map((donor) => donor.userId);

    if (userIds.length > 0) {
      const userResult = await prisma.user.updateMany({
        where: {
          id: {
            in: userIds,
          },
        },
        data: {
          isVerified: true,
        },
      });

      console.log(`Updated ${userResult.count} users to verified status`);
    }

    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Error updating donors:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
updateExistingDonors()
  .then(() => {
    console.log('Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Failed:', error);
    process.exit(1);
  });
