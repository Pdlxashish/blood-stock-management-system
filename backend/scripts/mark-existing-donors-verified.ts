import { prisma } from '../lib/prisma';

async function markExistingDonorsVerified() {
  try {
    console.log('🔄 Marking all existing donors as VERIFIED...');

    // Update all donors with PENDING status to VERIFIED
    const result = await prisma.donor.updateMany({
      where: {
        verificationStatus: 'PENDING',
      },
      data: {
        verificationStatus: 'VERIFIED',
        verifiedAt: new Date(),
      },
    });

    console.log(`✅ Updated ${result.count} donors to VERIFIED status`);

    // Also ensure all users with donor profiles are marked as verified
    const donors = await prisma.donor.findMany({
      where: {
        verificationStatus: 'VERIFIED',
      },
      select: {
        userId: true,
      },
    });

    const userIds = donors.map(d => d.userId);

    const userResult = await prisma.user.updateMany({
      where: {
        id: { in: userIds },
      },
      data: {
        isVerified: true,
      },
    });

    console.log(`✅ Updated ${userResult.count} users to verified status`);

    // Show summary
    const stats = await prisma.donor.groupBy({
      by: ['verificationStatus'],
      _count: true,
    });

    console.log('\n📊 Verification Status Summary:');
    stats.forEach(stat => {
      console.log(`   ${stat.verificationStatus}: ${stat._count}`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

markExistingDonorsVerified();
