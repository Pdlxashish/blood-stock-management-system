// Script to identify and fix organization donors that were created before donorType field
import { prisma } from './lib/prisma';

async function fixOrganizationDonors() {
  try {
    console.log('Finding potential organization donors...\n');
    
    // Find all donors with users that have password 'ORGANIZATION'
    // These are bulk collection organizations
    const orgUsers = await prisma.user.findMany({
      where: {
        password: 'ORGANIZATION',
        role: 'DONOR',
      },
      include: {
        donor: true,
      }
    });

    console.log(`Found ${orgUsers.length} organization users\n`);

    if (orgUsers.length === 0) {
      console.log('No organization users found.');
      console.log('This means no bulk collections have been submitted yet.');
      return;
    }

    // Update donors to have ORGANIZATION type
    let updatedCount = 0;
    for (const user of orgUsers) {
      if (user.donor) {
        if (user.donor.donorType !== 'ORGANIZATION') {
          await prisma.donor.update({
            where: { id: user.donor.id },
            data: { donorType: 'ORGANIZATION' },
          });
          console.log(`✅ Updated donor: ${user.name} (${user.phone}) to ORGANIZATION type`);
          updatedCount++;
        } else {
          console.log(`✓ Already correct: ${user.name} (${user.phone})`);
        }
      } else {
        console.log(`⚠️  User ${user.name} has no donor profile`);
      }
    }

    console.log(`\n✅ Updated ${updatedCount} donors to ORGANIZATION type`);
    
    // Verify the fix
    const orgDonors = await prisma.donor.findMany({
      where: { donorType: 'ORGANIZATION' },
      include: { user: true },
    });
    
    console.log(`\nVerification: ${orgDonors.length} ORGANIZATION donors now exist:`);
    orgDonors.forEach(d => {
      console.log(`  - ${d.user.name} (${d.user.phone})`);
    });

  } catch (error: any) {
    console.error('Error:', error.message);
  }
}

fixOrganizationDonors();
