// ============================================================
// RepoPulse — Set Custom Admin Email & Password CLI Tool
// Usage:
//   npm run set-admin <email_or_username> <password>
//   npx tsx src/scripts/set_admin.ts user@example.com mypassword123
// ============================================================

import 'dotenv/config';
import { prisma } from '../lib/prisma.js';
import crypto from 'crypto';

function hashPassword(password: string, salt: string): string {
  return crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
}

async function setAdminCredentials() {
  const args = process.argv.slice(2);
  const identifier = args[0] || process.env.ADMIN_EMAIL || 'admin';
  const newPassword = args[1] || process.env.ADMIN_PASSWORD || 'admin123';

  if (!identifier || !newPassword) {
    console.error('❌ Usage: npm run set-admin <email_or_username> <password>');
    process.exit(1);
  }

  if (newPassword.length < 6) {
    console.error('❌ Password must be at least 6 characters long.');
    process.exit(1);
  }

  const isEmail = identifier.includes('@');
  const email = isEmail ? identifier.trim().toLowerCase() : `${identifier.trim().toLowerCase()}@repopulse.io`;
  const username = isEmail ? identifier.split('@')[0].trim().toLowerCase() : identifier.trim().toLowerCase();

  console.log(`🔐 Setting up Admin Account:`);
  console.log(`   Username : ${username}`);
  console.log(`   Email    : ${email}`);

  // Generate new salt and hash
  const salt = crypto.randomBytes(16).toString('hex');
  const passwordHash = hashPassword(newPassword, salt);

  // Check if admin account exists
  const existing: any[] = await prisma.$queryRaw`
    SELECT id, username, email FROM "AdminAccount" LIMIT 1;
  `;

  if (existing.length > 0) {
    const adminId = existing[0].id;
    await prisma.$executeRawUnsafe(`
      UPDATE "AdminAccount"
      SET username = $1, email = $2, password_hash = $3, salt = $4, updated_at = NOW()
      WHERE id = $5;
    `, username, email, passwordHash, salt, adminId);

    console.log(`\n✅ Admin account updated successfully in database!`);
  } else {
    const id = crypto.randomUUID();
    await prisma.$executeRawUnsafe(`
      INSERT INTO "AdminAccount" (id, username, email, password_hash, salt, name)
      VALUES ($1, $2, $3, $4, $5, $6);
    `, id, username, email, passwordHash, salt, 'Fleet Administrator');

    console.log(`\n✨ Admin account created successfully in database!`);
  }

  console.log(`\n🎉 You can now log in at http://localhost:5173/login with:`);
  console.log(`   📧 Login ID : ${email} (or "${username}")`);
  console.log(`   🔑 Password : ${newPassword}`);
}

setAdminCredentials()
  .catch((err) => {
    console.error('❌ Failed to set admin credentials:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
