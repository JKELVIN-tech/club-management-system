import prisma from '../../config/prisma';
import { AppError } from '../../middleware/errorHandler';
import { MembershipStatus, Role } from '@prisma/client';

const MEMBER_LIST_SELECT = {
  id: true,
  firstName: true,
  lastName: true,
  email: true,
  phone: true,
  role: true,
  status: true,
  joinDate: true,
  profilePhotoUrl: true,
} as const;

interface ListMembersFilters {
  status?: MembershipStatus;
  role?: Role;
  search?: string;
  page?: number;
  pageSize?: number;
}

export async function listMembers(filters: ListMembersFilters) {
  const page = filters.page ?? 1;
  const pageSize = filters.pageSize ?? 25;

  const where: any = {};
  if (filters.status) where.status = filters.status;
  if (filters.role) where.role = filters.role;
  if (filters.search) {
    where.OR = [
      { firstName: { contains: filters.search, mode: 'insensitive' } },
      { lastName: { contains: filters.search, mode: 'insensitive' } },
      { email: { contains: filters.search, mode: 'insensitive' } },
    ];
  }

  const [members, total] = await Promise.all([
    prisma.member.findMany({
      where,
      select: MEMBER_LIST_SELECT,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.member.count({ where }),
  ]);

  return {
    members,
    pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
  };
}

export async function getMemberById(id: string) {
  const member = await prisma.member.findUnique({
    where: { id },
    select: MEMBER_LIST_SELECT,
  });
  if (!member) throw new AppError('Member not found', 404);
  return member;
}

export async function updateMemberProfile(
  id: string,
  data: { firstName?: string; lastName?: string; phone?: string; profilePhotoUrl?: string }
) {
  const member = await prisma.member.update({
    where: { id },
    data,
    select: MEMBER_LIST_SELECT,
  });
  return member;
}

export async function updateMemberStatus(
  id: string,
  status: MembershipStatus,
  actedById: string
) {
  const member = await prisma.member.update({
    where: { id },
    data: { status },
    select: MEMBER_LIST_SELECT,
  });

  await prisma.auditLog.create({
    data: {
      memberId: actedById,
      action: `MEMBER_STATUS_CHANGED_TO_${status}`,
      entityType: 'Member',
      entityId: id,
    },
  });

  return member;
}

export async function updateMemberRole(id: string, role: Role, actedById: string) {
  const member = await prisma.member.update({
    where: { id },
    data: { role },
    select: MEMBER_LIST_SELECT,
  });

  await prisma.auditLog.create({
    data: {
      memberId: actedById,
      action: `MEMBER_ROLE_CHANGED_TO_${role}`,
      entityType: 'Member',
      entityId: id,
    },
  });

  return member;
}

export async function deleteMember(id: string) {
  await prisma.member.delete({ where: { id } });
}

export async function getMembershipStats() {
  const [total, byStatus, byRole] = await Promise.all([
    prisma.member.count(),
    prisma.member.groupBy({ by: ['status'], _count: true }),
    prisma.member.groupBy({ by: ['role'], _count: true }),
  ]);

  return { total, byStatus, byRole };
}
