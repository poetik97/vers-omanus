// Wrapper para PrismaClient compatível com ESM e CommonJS
import type { PrismaClient as PrismaClientType } from '@prisma/client';

let PrismaClient: typeof PrismaClientType;

try {
  // Tenta import ESM
  const prismaModule = await import('@prisma/client');
  PrismaClient = prismaModule.PrismaClient;
} catch {
  // Fallback para CommonJS (produção)
  const createRequire = (await import('module')).createRequire;
  const require = createRequire(import.meta.url);
  const prismaModule = require('@prisma/client');
  PrismaClient = prismaModule.PrismaClient;
}

export { PrismaClient };
export default PrismaClient;

