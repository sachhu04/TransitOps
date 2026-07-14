const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function deleteUser() {
  const result = await prisma.user.deleteMany({
    where: { 
      email: 'goodonessck@gmail.com',
      role: { not: 'ADMIN' } // Ensure we don't accidentally delete their admin account if they have one with this email (though the previous check showed only SAFETY_OFFICER)
    }
  });
  console.log('Deleted users:', result.count);
}

deleteUser()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
