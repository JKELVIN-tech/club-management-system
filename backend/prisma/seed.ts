import { PrismaClient, Role, MembershipStatus } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.SEED_ADMIN_EMAIL || 'admin@club.local';
  const adminPassword = process.env.SEED_ADMIN_PASSWORD;

  if (!adminPassword) {
    throw new Error(
      'SEED_ADMIN_PASSWORD is required when running the database seed. Set it in your local environment and never commit it.'
    );
  }

  const existing = await prisma.member.findUnique({ where: { email: adminEmail } });

  if (existing) {
    console.log('Admin account already exists, skipping seed.');
    return;
  }

  const passwordHash = await bcrypt.hash(adminPassword, 12);

  const admin = await prisma.member.create({
    data: {
      firstName: 'System',
      lastName: 'Admin',
      email: adminEmail,
      passwordHash,
      role: Role.ADMIN,
      status: MembershipStatus.ACTIVE,
    },
  });

  console.log(`Seeded admin account: ${admin.email}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
