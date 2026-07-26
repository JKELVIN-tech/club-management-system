import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { AppError } from '../../middleware/errorHandler';
import * as membersService from './members.service';
import { MembershipStatus, Role } from '@prisma/client';

export const list = asyncHandler(async (req: Request, res: Response) => {
  const { status, role, search, page, pageSize } = req.query;
  const result = await membersService.listMembers({
    status: status as MembershipStatus | undefined,
    role: role as Role | undefined,
    search: search as string | undefined,
    page: page ? parseInt(page as string, 10) : undefined,
    pageSize: pageSize ? parseInt(pageSize as string, 10) : undefined,
  });
  res.json(result);
});

export const getById = asyncHandler(async (req: Request, res: Response) => {
  const member = await membersService.getMemberById(req.params.id);
  res.json({ member });
});

export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
  const { firstName, lastName, phone, profilePhotoUrl } = req.body;
  const member = await membersService.updateMemberProfile(req.params.id, {
    firstName,
    lastName,
    phone,
    profilePhotoUrl,
  });
  res.json({ member });
});

export const updateStatus = asyncHandler(async (req: Request, res: Response) => {
  const { status } = req.body;
  if (!Object.values(MembershipStatus).includes(status)) {
    throw new AppError('Invalid membership status', 422);
  }
  const member = await membersService.updateMemberStatus(
    req.params.id,
    status,
    req.user!.memberId
  );
  res.json({ member });
});

export const updateRole = asyncHandler(async (req: Request, res: Response) => {
  const { role } = req.body;
  if (!Object.values(Role).includes(role)) {
    throw new AppError('Invalid role', 422);
  }
  const member = await membersService.updateMemberRole(
    req.params.id,
    role,
    req.user!.memberId
  );
  res.json({ member });
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  await membersService.deleteMember(req.params.id);
  res.status(204).send();
});

export const stats = asyncHandler(async (req: Request, res: Response) => {
  const data = await membersService.getMembershipStats();
  res.json(data);
});
