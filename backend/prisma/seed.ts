import { PrismaClient, Role, MembershipStatus } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const adminEmail = 'admin@club.local';
  const existing = await prisma.member.findUnique({ where: { email: adminEmail } });

  if (existing) {
    console.log('Admin account already exists, skipping seed.');
    return;
  }

  const passwordHash = await bcrypt.hash('ChangeMe123!', 12);

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

  console.log('Seeded admin account:', admin.email);
  console.log('Default password: ChangeMe123! — change this immediately after first login.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
