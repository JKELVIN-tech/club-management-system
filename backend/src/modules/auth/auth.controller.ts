import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { asyncHandler } from '../../utils/asyncHandler';
import { registerMember, loginMember } from './auth.service';
import { AppError } from '../../middleware/errorHandler';
import prisma from '../../config/prisma';

export const register = asyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  const member = await registerMember(req.body);
  res.status(201).json({
    message: 'Registration successful. Your account is pending approval.',
    member,
  });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  const { email, password } = req.body;
  const result = await loginMember(email, password);
  res.json(result);
});

export const getCurrentMember = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw new AppError('Not authenticated', 401);

  const member = await prisma.member.findUnique({
    where: { id: req.user.memberId },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      role: true,
      status: true,
      joinDate: true,
      profilePhotoUrl: true,
    },
  });

  if (!member) throw new AppError('Member not found', 404);
  res.json({ member });
});
