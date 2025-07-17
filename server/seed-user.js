const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding initial user...');
  const user = await prisma.user.upsert({
      where: { email: 'dev@example.com' },
      update: {},
      create: {
        id: 'clerk-user-id-12345', // Example of a Clerk or other auth provider ID
        email: 'dev@example.com',
        name: 'Dev User',
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
