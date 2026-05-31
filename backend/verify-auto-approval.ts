import { prisma } from './lib/prisma';

async function verifyAutoApproval() {
  const donor = await prisma.donor.findUnique({
    where: { id: 'cmpocqki30001gg0nwsd6oun3' },
    include: { user: true },
  });

  console.log('\n✅ Donor Auto-Approval Verification:');
  console.log('=' .repeat(60));
  console.log(`Name: ${donor?.user.name}`);
  console.log(`Email: ${donor?.user.email}`);
  console.log(`Phone: ${donor?.user.phone}`);
  console.log(`User isVerified: ${donor?.user.isVerified}`);
  console.log(`User emailVerified: ${donor?.user.emailVerified}`);
  console.log(`Donor verificationStatus: ${donor?.verificationStatus}`);
  console.log(`Donor verifiedBy: ${donor?.verifiedBy}`);
  console.log(`Donor verifiedAt: ${donor?.verifiedAt}`);
  console.log('=' .repeat(60));
  
  if (donor?.verificationStatus === 'VERIFIED' && donor?.verifiedBy === 'SYSTEM_AUTO_APPROVED') {
    console.log('\n✅ SUCCESS! Donor was AUTO-APPROVED via claim account process!');
  } else {
    console.log('\n❌ FAILED! Donor was not auto-approved.');
  }
}

verifyAutoApproval();
