// Quick script to check if donorType field exists and has correct values
import { prisma } from './lib/prisma';

async function checkDonorTypes() {
  try {
    console.log('Checking donor types in database...\n');
    
    // Get all donors with their donorType
    const donors = await prisma.donor.findMany({
      select: {
        id: true,
        donorType: true,
        user: {
          select: {
            name: true,
            phone: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    console.log(`Total donors found: ${donors.length}\n`);
    
    // Count by type
    const personCount = donors.filter(d => d.donorType === 'PERSON').length;
    const orgCount = donors.filter(d => d.donorType === 'ORGANIZATION').length;
    
    console.log(`PERSON donors: ${personCount}`);
    console.log(`ORGANIZATION donors: ${orgCount}\n`);
    
    // Show organization donors
    const orgDonors = donors.filter(d => d.donorType === 'ORGANIZATION');
    if (orgDonors.length > 0) {
      console.log('Organization donors:');
      orgDonors.forEach(d => {
        console.log(`  - ${d.user.name} (${d.user.phone}) - Type: ${d.donorType}`);
      });
    } else {
      console.log('⚠️  No ORGANIZATION donors found!');
      console.log('This means bulk collections are not creating organization donors correctly.');
    }
    
  } catch (error: any) {
    console.error('Error checking donor types:', error.message);
    if (error.message.includes('donorType')) {
      console.error('\n❌ The donorType column does not exist in the database!');
      console.error('Run: npm run migrate');
    }
  }
}

checkDonorTypes();
