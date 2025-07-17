const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createDefaultUser() {
  try {
    const user = await prisma.user.upsert({
      where: { id: 'user_placeholder' },
      update: {},
      create: {
        id: 'user_placeholder',
        email: 'placeholder@example.com',
        name: 'Default User',
      }
    });
    
    console.log('✅ Default user created:', user);
  } catch (error) {
    console.error('Error creating user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createDefaultUser();
