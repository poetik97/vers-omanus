import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function test() {
  try {
    console.log('Testing Prisma connection...');
    const users = await prisma.user.findMany();
    console.log('✅ Connection successful!');
    console.log('Users found:', users.length);
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

test();
