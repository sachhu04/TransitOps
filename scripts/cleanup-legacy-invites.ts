import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting cleanup of legacy pending users...');
  
  const pendingUsers = await prisma.user.findMany({
    where: { password: null }
  });

  console.log(`Found ${pendingUsers.length} legacy pending users without passwords.`);

  let deletedCount = 0;
  for (const user of pendingUsers) {
    try {
      await prisma.user.delete({ where: { id: user.id } });
      deletedCount++;
      console.log(`Deleted legacy user: ${user.email}`);
    } catch (e) {
      console.error(`Failed to delete legacy user ${user.email}:`, e);
    }
  }

  console.log(`Cleanup complete. Deleted ${deletedCount} legacy pending users.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
