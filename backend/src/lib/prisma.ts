import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

declare global {
  // Prevent multiple instances of Prisma Client in development
  var prismaGlobal: PrismaClient | undefined;
}

export const prisma = global.prismaGlobal || new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
});

if (process.env.NODE_ENV !== 'production') {
  global.prismaGlobal = prisma;
}

export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    console.log('✅ [Database] Successfully connected to Supabase PostgreSQL!');
    return true;
  } catch (error: any) {
    console.warn('⚠️ [Database Warning] Could not connect to database with current credentials:');
    console.warn(`   Reason: ${error.message?.split('\n')[0] || error.message}`);
    console.warn('   💡 Tip: Update DATABASE_URL and DIRECT_URL in backend/.env with your Supabase credentials.');
    return false;
  }
}
