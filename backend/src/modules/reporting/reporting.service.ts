import prisma from '../../config/prisma';
import { PaymentStatus, EventStatus, AttendanceStatus } from '@prisma/client';

// ── Membership reporting ────────────────────────────────────────

export async function getMembershipReport() {
  const [total, byStatus, byRole, growth] = await Promise.all([
    prisma.member.count(),
    prisma.member.groupBy({ by: ['status'], _count: true }),
    prisma.member.groupBy({ by: ['role'], _count: true }),
    // Monthly new-member counts for the last 12 months (Postgres date_trunc)
    prisma.$queryRaw<{ month: Date; count: bigint }[]>`
      SELECT date_trunc('month', "joinDate") AS month, COUNT(*)::bigint AS count
      FROM "Member"
      WHERE "joinDate" >= NOW() - INTERVAL '12 months'
      GROUP BY month
      ORDER BY month ASC
    `,
  ]);

  return {
    total,
    byStatus,
    byRole,
    growth: growth.map((g: { month: Date; count: bigint }) => ({ month: g.month, count: Number(g.count) })),
  };
}

// ── Financial reporting ──────────────────────────────────────────

export async function getFinancialReport() {
  const [totalCollected, outstandingAgg, byStatus, monthlyCollected] = await Promise.all([
    prisma.payment.aggregate({ _sum: { amountPaid: true } }),
    prisma.payment.aggregate({
      where: { status: { in: [PaymentStatus.PENDING, PaymentStatus.OVERDUE, PaymentStatus.PARTIAL] } },
      _sum: { amount: true, amountPaid: true },
    }),
    prisma.payment.groupBy({ by: ['status'], _count: true, _sum: { amount: true } }),
    prisma.$queryRaw<{ month: Date; total: string }[]>`
      SELECT date_trunc('month', "paidAt") AS month, COALESCE(SUM("amountPaid"), 0)::text AS total
      FROM "Payment"
      WHERE "paidAt" IS NOT NULL AND "paidAt" >= NOW() - INTERVAL '12 months'
      GROUP BY month
      ORDER BY month ASC
    `,
  ]);

  const outstanding =
    Number(outstandingAgg._sum.amount ?? 0) - Number(outstandingAgg._sum.amountPaid ?? 0);

  return {
    totalCollected: Number(totalCollected._sum.amountPaid ?? 0),
    totalOutstanding: outstanding,
    byStatus,
    monthlyCollected: monthlyCollected.map((m: { month: Date; total: string }) => ({ month: m.month, total: Number(m.total) })),
  };
}

// ── Event reporting ───────────────────────────────────────────────

export async function getEventsReport() {
  const [byStatus, completedEvents] = await Promise.all([
    prisma.event.groupBy({ by: ['status'], _count: true }),
    prisma.event.findMany({
      where: { status: EventStatus.COMPLETED },
      include: {
        attendance: true,
        postEventReport: true,
      },
      orderBy: { startTime: 'desc' },
      take: 12,
    }),
  ]);

  const attendanceRates = completedEvents.map(
    (e: {
      id: string;
      title: string;
      startTime: Date;
      attendance: { status: AttendanceStatus }[];
    }) => {
      const registered = e.attendance.length;
      const attended = e.attendance.filter(
        (a: { status: AttendanceStatus }) => a.status === AttendanceStatus.ATTENDED
      ).length;
      return {
        eventId: e.id,
        title: e.title,
        startTime: e.startTime,
        registered,
        attended,
        attendanceRate: registered > 0 ? Math.round((attended / registered) * 100) : 0,
      };
    }
  );

  return { byStatus, attendanceRates };
}

// ── Combined overview ──────────────────────────────────────────────

export async function getOverviewReport() {
  const [membership, financial, events] = await Promise.all([
    getMembershipReport(),
    getFinancialReport(),
    getEventsReport(),
  ]);

  return { membership, financial, events };
}
