import 'dotenv/config';
import { prisma } from '../lib/prisma.js';
import crypto from 'crypto';

function hashPassword(password: string, salt: string): string {
  return crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
}

async function setupAdminTable() {
  console.log('🚀 Setting up AdminAccount table in Supabase PostgreSQL...');

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "AdminAccount" (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      salt TEXT NOT NULL,
      name TEXT NOT NULL DEFAULT 'Administrator',
      created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW()
    );
  `);

  console.log('✅ AdminAccount table verified.');

  // Check if admin already exists
  const existing: any[] = await prisma.$queryRaw`
    SELECT * FROM "AdminAccount" WHERE username = 'admin' LIMIT 1;
  `;

  if (existing.length === 0) {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = hashPassword('admin123', salt);
    const id = crypto.randomUUID();

    await prisma.$executeRawUnsafe(`
      INSERT INTO "AdminAccount" (id, username, email, password_hash, salt, name)
      VALUES ($1, $2, $3, $4, $5, $6);
    `, id, 'admin', 'admin@repopulse.io', hash, salt, 'Fleet Administrator');

    console.log('✨ Created default admin account:');
    console.log('   Username: admin');
    console.log('   Password: admin123');
  } else {
    console.log('ℹ️ Admin account already exists in database.');
  }
}

setupAdminTable().catch(console.error).finally(() => prisma.$disconnect());
