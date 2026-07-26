import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { asyncHandler } from '../../utils/asyncHandler';
import * as financeService from './finance.service';
import { PaymentStatus } from '@prisma/client';

export const createFeeSchedule = asyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });

  const feeSchedule = await financeService.createFeeSchedule(req.body);
  res.status(201).json({ feeSchedule });
});

export const listFeeSchedules = asyncHandler(async (req: Request, res: Response) => {
  const feeSchedules = await financeService.listFeeSchedules();
  res.json({ feeSchedules });
});

export const deleteFeeSchedule = asyncHandler(async (req: Request, res: Response) => {
  await financeService.deleteFeeSchedule(req.params.id);
  res.status(204).send();
});

export const recordPayment = asyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });

  const payment = await financeService.recordPayment(req.body, req.user!.memberId);
  res.status(201).json({ payment });
});

export const listPayments = asyncHandler(async (req: Request, res: Response) => {
  const { status, page, pageSize } = req.query;

  // Members may only ever see their own payment history; privileged roles
  // can filter by any memberId (or omit it to see everyone's).
  const isPrivileged = ['ADMIN', 'TREASURER'].includes(req.user!.role);
  const memberId = isPrivileged
    ? (req.query.memberId as string | undefined)
    : req.user!.memberId;

  const result = await financeService.listPayments({
    memberId,
    status: status as PaymentStatus | undefined,
    page: page ? parseInt(page as string, 10) : undefined,
    pageSize: pageSize ? parseInt(pageSize as string, 10) : undefined,
  });
  res.json(result);
});

export const getReceipt = asyncHandler(async (req: Request, res: Response) => {
  const payment = await financeService.getPaymentReceipt(req.params.id);

  const isPrivileged = ['ADMIN', 'TREASURER'].includes(req.user!.role);
  if (!isPrivileged && payment.memberId !== req.user!.memberId) {
    return res.status(403).json({ error: 'You may only view your own receipts' });
  }

  res.json({ payment });
});

export const getDefaulters = asyncHandler(async (req: Request, res: Response) => {
  const defaulters = await financeService.getDefaulters();
  res.json({ defaulters });
});

export const getSummary = asyncHandler(async (req: Request, res: Response) => {
  const summary = await financeService.getFinancialSummary();
  res.json(summary);
});
