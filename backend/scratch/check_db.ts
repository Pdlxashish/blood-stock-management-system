import { prisma } from '../lib/prisma';

async function main() {
  const users = await prisma.user.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    include: { donor: true }
  });
  console.log('Recent Users:');
  console.log(JSON.stringify(users, null, 2));
}

main().catch(console.error);
