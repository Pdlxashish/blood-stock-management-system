import { PrismaClient } from '../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import 'dotenv/config';

const connectionString = `${process.env.DATABASE_URL}`;

const pool = new Pool({
  connectionString,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter });

async function updateWhatsApp() {
  try {
    // Find the first About record
    const about = await prisma.about.findFirst();
    
    if (about) {
      // Update with WhatsApp fields
      const updated = await prisma.about.update({
        where: { id: about.id },
        data: {
          whatsappNumber: '+977-9800000000',
          whatsappEnabled: true,
        },
      });
      console.log('✅ WhatsApp fields updated successfully!');
      console.log('WhatsApp Number:', updated.whatsappNumber);
      console.log('WhatsApp Enabled:', updated.whatsappEnabled);
    } else {
      // Create new record with WhatsApp fields
      const created = await prisma.about.create({
        data: {
          whatsappNumber: '+977-9800000000',
          whatsappEnabled: true,
        },
      });
      console.log('✅ About record created with WhatsApp fields!');
      console.log('WhatsApp Number:', created.whatsappNumber);
      console.log('WhatsApp Enabled:', created.whatsappEnabled);
    }
  } catch (error: any) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

updateWhatsApp();
