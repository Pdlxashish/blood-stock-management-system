import { prisma } from '../lib/prisma';

async function seedAbout() {
  try {
    // Check if About record exists
    const existing = await prisma.about.findFirst();

    if (existing) {
      // Update existing record with WhatsApp info
      await prisma.about.update({
        where: { id: existing.id },
        data: {
          whatsappNumber: '+977-9800000000',
          whatsappEnabled: true,
        },
      });
      console.log('✅ Updated About record with WhatsApp info');
    } else {
      // Create new About record
      await prisma.about.create({
        data: {
          whatsappNumber: '+977-9800000000',
          whatsappEnabled: true,
        },
      });
      console.log('✅ Created About record with WhatsApp info');
    }

    console.log('✅ About data seeded successfully!');
  } catch (error) {
    console.error('❌ Error seeding About data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedAbout();
