import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const email = 'sachin23bcs64@iiitkottayam.ac.in';

  const user = await prisma.user.findUnique({ where: { email } });
  if (user) {
    console.log('Found in User table:', user);
  } else {
    console.log('Not found in User table');
  }

  const invitation = await prisma.invitation.findUnique({ where: { email } });
  if (invitation) {
    console.log('Found in Invitation table:', invitation);
  } else {
    console.log('Not found in Invitation table');
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
