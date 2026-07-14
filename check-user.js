const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkUser() {
  const users = await prisma.user.findMany({
    where: { email: 'goodonessck@gmail.com' }
  });
  console.log(users);
}

checkUser()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
