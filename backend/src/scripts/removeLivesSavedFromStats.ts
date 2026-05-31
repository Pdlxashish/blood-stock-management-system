import 'dotenv/config';
import { prisma } from '../../lib/prisma';

/**
 * Script to remove "Lives Saved" from About stats
 * Run with: npx tsx src/scripts/removeLivesSavedFromStats.ts
 */
async function removeLivesSavedFromStats() {
  try {
    console.log('🔄 Removing "Lives Saved" from About stats...');

    // Get all About records
    const aboutRecords = await prisma.about.findMany();

    if (aboutRecords.length === 0) {
      console.log('ℹ️  No About records found in database.');
      return;
    }

    console.log(`📊 Found ${aboutRecords.length} About record(s)`);

    for (const about of aboutRecords) {
      try {
        // Parse the stats JSON
        const stats = JSON.parse(about.stats);
        
        // Filter out "Lives Saved" stat
        const updatedStats = stats.filter((stat: any) => 
          stat.label !== 'Lives Saved' && 
          !stat.label.toLowerCase().includes('lives saved')
        );

        // Only update if something was removed
        if (updatedStats.length < stats.length) {
          await prisma.about.update({
            where: { id: about.id },
            data: {
              stats: JSON.stringify(updatedStats),
            },
          });

          console.log(`✅ Updated About record ${about.id}`);
          console.log(`   Removed ${stats.length - updatedStats.length} stat(s)`);
          console.log(`   Old stats count: ${stats.length}`);
          console.log(`   New stats count: ${updatedStats.length}`);
        } else {
          console.log(`ℹ️  About record ${about.id} doesn't have "Lives Saved" stat`);
        }
      } catch (error) {
        console.error(`❌ Error processing About record ${about.id}:`, error);
      }
    }

    console.log('\n🎉 Done! "Lives Saved" has been removed from all About stats.');
  } catch (error) {
    console.error('❌ Error removing Lives Saved from stats:', error);
  } finally {
    await prisma.$disconnect();
  }
}

removeLivesSavedFromStats();
