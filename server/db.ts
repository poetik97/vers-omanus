import { PrismaClient } from '@prisma/client';

// Clean DATABASE_URL - remove unsupported parameters and whitespace
if (process.env.DATABASE_URL) {  // Remove literal \\n, newlines, carriage returns, and trim
  let cleanUrl = process.env.DATABASE_URL
    .replace(/\\\\n/g, '')  // Remove literal \\n
    .replace(/\\n/g, '')    // Remove \n  
    .replace(/\n/g, '')     // Remove actual newlines
    .replace(/\r/g, '')     // Remove carriage returns
    .trim();  
  // Remove pgbouncer parameter (not supported by Prisma)
  cleanUrl = cleanUrl.replace(/[?&]pgbouncer=true/g, '');
  
  // If URL ends with just '?', remove it
  cleanUrl = cleanUrl.replace(/\?$/, '');
  
  process.env.DATABASE_URL = cleanUrl;
  console.log('[Database] Cleaned DATABASE_URL');
}

// Clean DIRECT_URL too
if (process.env.DIRECT_URL) {
  let cleanUrl = process.env.DIRECT_URL
    .replace(/\\\\n/g, '')  // Remove literal \\n
    .replace(/\\n/g, '')    // Remove \n
    .replace(/\n/g, '')     // Remove actual newlines
    .replace(/\r/g, '')     // Remove carriage returns
    .trim();
  cleanUrl = cleanUrl.replace(/[?&]pgbouncer=true/g, '');
  cleanUrl = cleanUrl.replace(/\?$/, '');
  process.env.DIRECT_URL = cleanUrl;
  console.log('[Database] Cleaned DIRECT_URL');
}

// Singleton Prisma Client
let prisma: PrismaClient;

declare global {
  var __prisma: PrismaClient | undefined;
}

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient();
} else {
  if (!global.__prisma) {
    global.__prisma = new PrismaClient();
  }
  prisma = global.__prisma;
}

export { prisma };
export default prisma;


// User management functions for OAuth
export async function upsertUser(userData: {
  id: string;
  name?: string | null;
  email?: string | null;
  loginMethod?: string | null;
  lastSignedIn?: Date;
  role?: 'user' | 'admin';
}) {
  try {
    return await prisma.users.upsert({
      where: { id: userData.id },
      update: {
        name: userData.name,
        email: userData.email,
        loginMethod: userData.loginMethod,
        lastSignedIn: userData.lastSignedIn || new Date(),
      },
      create: {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        loginMethod: userData.loginMethod,
        role: userData.role || 'user',
        lastSignedIn: new Date(),
      },
    });
  } catch (error) {
    console.error('[Database] Failed to upsert user:', error);
    throw error;
  }
}

export async function getUser(id: string) {
  try {
    return await prisma.users.findUnique({
      where: { id },
    });
  } catch (error) {
    console.error('[Database] Failed to get user:', error);
    return null;
  }
}

