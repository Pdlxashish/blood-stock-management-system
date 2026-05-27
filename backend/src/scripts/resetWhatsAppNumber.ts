import 'dotenv/config';
import { prisma } from '../../lib/prisma';

/**
 * Script to reset WhatsApp number from .env file
 * Run with: npx ts-node src/scripts/resetWhatsAppNumber.ts
 */
async function resetWhatsAppNumber() {
  try {
    console.log('🔄 Resetting WhatsApp number from .env...');
    console.log('📱 New number from .env:', process.env.WHATSAPP_NUMBER);
    console.log('✅ Enabled status from .env:', process.env.WHATSAPP_ENABLED);

    // Get the first About record
    const about = await prisma.about.findFirst();

    if (about) {
      // Update existing record
      const updated = await prisma.about.update({
        where: { id: about.id },
        data: {
          whatsappNumber: process.env.WHATSAPP_NUMBER || '+977-9800000000',
          whatsappEnabled: process.env.WHATSAPP_ENABLED === 'true',
        },
      });

      console.log('✅ WhatsApp settings updated successfully!');
      console.log('📱 New WhatsApp Number:', updated.whatsappNumber);
      console.log('✅ WhatsApp Enabled:', updated.whatsappEnabled);
    } else {
      // Create new record
      const created = await prisma.about.create({
        data: {
          whatsappNumber: process.env.WHATSAPP_NUMBER || '+977-9800000000',
          whatsappEnabled: process.env.WHATSAPP_ENABLED === 'true',
        },
      });

      console.log('✅ About record created with WhatsApp settings!');
      console.log('📱 WhatsApp Number:', created.whatsappNumber);
      console.log('✅ WhatsApp Enabled:', created.whatsappEnabled);
    }

    console.log('\n🎉 Done! The WhatsApp number has been updated.');
    console.log('💡 Refresh your frontend to see the changes.');
  } catch (error) {
    console.error('❌ Error resetting WhatsApp number:', error);
  } finally {
    await prisma.$disconnect();
  }
}

resetWhatsAppNumber();
