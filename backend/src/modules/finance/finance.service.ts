import prisma from '../../config/prisma';
import { AppError } from '../../middleware/errorHandler';
import { FeeType, PaymentStatus, PaymentMethod } from '@prisma/client';

// ── Fee Schedules ──────────────────────────────────────────────

interface CreateFeeScheduleInput {
  name: string;
  type: FeeType;
  amount: number;
  dueDate?: string;
  recurring?: boolean;
  description?: string;
}

export async function createFeeSchedule(input: CreateFeeScheduleInput) {
  return prisma.feeSchedule.create({
    data: {
      name: input.name,
      type: input.type,
      amount: input.amount,
      dueDate: input.dueDate ? new Date(input.dueDate) : undefined,
      recurring: input.recurring ?? false,
      description: input.description,
    },
  });
}

export async function listFeeSchedules() {
  return prisma.feeSchedule.findMany({ orderBy: { createdAt: 'desc' } });
}

export async function deleteFeeSchedule(id: string) {
  const inUse = await prisma.payment.count({ where: { feeScheduleId: id } });
  if (inUse > 0) {
    throw new AppError(
      'Cannot delete a fee schedule that already has payments recorded against it',
      409
    );
  }
  await prisma.feeSchedule.delete({ where: { id } });
}

// ── Payments ────────────────────────────────────────────────────

function generateReceiptNumber(): string {
  const year = new Date().getFullYear();
  const random = Math.floor(100000 + Math.random() * 900000);
  return `RCT-${year}-${random}`;
}

function resolveStatus(amount: number, amountPaid: number): PaymentStatus {
  if (amountPaid <= 0) return PaymentStatus.PENDING;
  if (amountPaid < amount) return PaymentStatus.PARTIAL;
  return PaymentStatus.PAID;
}

interface RecordPaymentInput {
  memberId: string;
  feeScheduleId?: string;
  amount: number;
  amountPaid?: number;
  method?: PaymentMethod;
  transactionRef?: string;
}

export async function recordPayment(input: RecordPaymentInput, actedById: string) {
  const member = await prisma.member.findUnique({ where: { id: input.memberId } });
  if (!member) throw new AppError('Member not found', 404);

  const amountPaid = input.amountPaid ?? input.amount;
  const status = resolveStatus(input.amount, amountPaid);

  const payment = await prisma.payment.create({
    data: {
      memberId: input.memberId,
      feeScheduleId: input.feeScheduleId,
      amount: input.amount,
      amountPaid,
      status,
      method: input.method,
      transactionRef: input.transactionRef,
      receiptNumber: amountPaid > 0 ? generateReceiptNumber() : undefined,
      paidAt: amountPaid > 0 ? new Date() : undefined,
    },
    include: {
      member: { select: { id: true, firstName: true, lastName: true, email: true } },
      feeSchedule: { select: { id: true, name: true, type: true } },
    },
  });

  await prisma.auditLog.create({
    data: {
      memberId: actedById,
      action: 'PAYMENT_RECORDED',
      entityType: 'Payment',
      entityId: payment.id,
      metadata: { memberId: input.memberId, amount: input.amount, amountPaid },
    },
  });

  return payment;
}

interface ListPaymentsFilters {
  memberId?: string;
  status?: PaymentStatus;
  page?: number;
  pageSize?: number;
}

export async function listPayments(filters: ListPaymentsFilters) {
  const page = filters.page ?? 1;
  const pageSize = filters.pageSize ?? 25;

  const where: any = {};
  if (filters.memberId) where.memberId = filters.memberId;
  if (filters.status) where.status = filters.status;

  const [payments, total] = await Promise.all([
    prisma.payment.findMany({
      where,
      include: {
        member: { select: { id: true, firstName: true, lastName: true, email: true } },
        feeSchedule: { select: { id: true, name: true, type: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.payment.count({ where }),
  ]);

  return {
    payments,
    pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
  };
}

export async function getPaymentReceipt(id: string) {
  const payment = await prisma.payment.findUnique({
    where: { id },
    include: {
      member: { select: { firstName: true, lastName: true, email: true } },
      feeSchedule: { select: { name: true, type: true } },
    },
  });
  if (!payment) throw new AppError('Payment not found', 404);
  if (!payment.receiptNumber) {
    throw new AppError('No receipt has been issued for this payment yet', 404);
  }
  return payment;
}

// ── Defaulters & Summary ───────────────────────────────────────

export async function getDefaulters() {
  return prisma.payment.findMany({
    where: { status: { in: [PaymentStatus.PENDING, PaymentStatus.OVERDUE, PaymentStatus.PARTIAL] } },
    include: {
      member: { select: { id: true, firstName: true, lastName: true, email: true } },
      feeSchedule: { select: { name: true, type: true } },
    },
    orderBy: { createdAt: 'asc' },
  });
}

export async function getFinancialSummary() {
  const [totalCollected, totalOutstanding, byStatus] = await Promise.all([
    prisma.payment.aggregate({
      _sum: { amountPaid: true },
    }),
    prisma.payment.aggregate({
      where: { status: { in: [PaymentStatus.PENDING, PaymentStatus.OVERDUE, PaymentStatus.PARTIAL] } },
      _sum: { amount: true, amountPaid: true },
    }),
    prisma.payment.groupBy({ by: ['status'], _count: true, _sum: { amount: true } }),
  ]);

  const outstanding =
    Number(totalOutstanding._sum.amount ?? 0) - Number(totalOutstanding._sum.amountPaid ?? 0);

  return {
    totalCollected: Number(totalCollected._sum.amountPaid ?? 0),
    totalOutstanding: outstanding,
    byStatus,
  };
}
