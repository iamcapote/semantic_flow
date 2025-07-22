const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding demo user...');
  const user = await prisma.user.upsert({
    where: { email: 'demo@semantic.app' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000000',
      email: 'demo@semantic.app',
      name: 'Demo User',
    },
  });
  console.log({ user });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
