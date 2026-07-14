import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const email = 'sachin23bcs64@iiitkottayam.ac.in';
  
  try {
    await prisma.user.delete({ where: { email } });
    console.log(`Successfully deleted ${email} from the database.`);
  } catch (e) {
    console.log(`Failed to delete ${email}:`, e);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
