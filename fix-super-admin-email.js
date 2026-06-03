const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const updated = await prisma.user.update({
    where: { id: '34b6c23e-3818-4e73-8c67-779e06933d85' },
    data: { email: 'admin@gmail.com' }
  });
  console.log('Successfully updated DB email to match Supabase Auth email:', updated);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
