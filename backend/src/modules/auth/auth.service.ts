import bcrypt from 'bcrypt';
import prisma from '../../config/prisma';
import { signToken } from '../../utils/jwt';
import { AppError } from '../../middleware/errorHandler';
import { MembershipStatus, Role } from '@prisma/client';

const SALT_ROUNDS = 12;

interface RegisterInput {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
}

export async function registerMember(input: RegisterInput) {
  const existing = await prisma.member.findUnique({ where: { email: input.email } });
  if (existing) {
    throw new AppError('An account with this email already exists', 409);
  }

  const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);

  // New registrations start PENDING and MEMBER role — an admin/secretary
  // must approve and can promote roles later. This mirrors the proposal's
  // requirement that registration is centrally tracked, not self-elevating.
  const member = await prisma.member.create({
    data: {
      firstName: input.firstName,
      lastName: input.lastName,
      email: input.email,
      phone: input.phone,
      passwordHash,
      role: Role.MEMBER,
      status: MembershipStatus.PENDING,
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      role: true,
      status: true,
      createdAt: true,
    },
  });

  await prisma.auditLog.create({
    data: {
      memberId: member.id,
      action: 'MEMBER_REGISTERED',
      entityType: 'Member',
      entityId: member.id,
    },
  });

  return member;
}

export async function loginMember(email: string, password: string) {
  const member = await prisma.member.findUnique({ where: { email } });

  if (!member) {
    throw new AppError('Invalid email or password', 401);
  }

  const valid = await bcrypt.compare(password, member.passwordHash);
  if (!valid) {
    throw new AppError('Invalid email or password', 401);
  }

  if (member.status === MembershipStatus.SUSPENDED || member.status === MembershipStatus.EXPELLED) {
    throw new AppError('Your account is not currently active. Contact a club official.', 403);
  }

  const token = signToken({
    memberId: member.id,
    role: member.role,
    email: member.email,
  });

  await prisma.auditLog.create({
    data: {
      memberId: member.id,
      action: 'MEMBER_LOGIN',
      entityType: 'Member',
      entityId: member.id,
    },
  });

  return {
    token,
    member: {
      id: member.id,
      firstName: member.firstName,
      lastName: member.lastName,
      email: member.email,
      role: member.role,
      status: member.status,
    },
  };
}
