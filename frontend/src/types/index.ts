export type Role = 'ADMIN' | 'TREASURER' | 'SECRETARY' | 'MEMBER';

export type MembershipStatus = 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'INACTIVE' | 'EXPELLED';

export interface Member {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  role: Role;
  status: MembershipStatus;
  joinDate: string;
  profilePhotoUrl?: string | null;
}

export interface AuthResponse {
  token: string;
  member: Member;
}

export interface PaginatedMembers {
  members: Member[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

// ── Finance ─────────────────────────────────────────────────────

export type FeeType = 'MEMBERSHIP_DUE' | 'LEVY' | 'EVENT_FEE' | 'FINE' | 'OTHER';
export type PaymentStatus = 'PENDING' | 'PAID' | 'PARTIAL' | 'OVERDUE' | 'WAIVED';
export type PaymentMethod = 'CASH' | 'MPESA' | 'BANK_TRANSFER' | 'CARD' | 'OTHER';

export interface FeeSchedule {
  id: string;
  name: string;
  type: FeeType;
  amount: string;
  dueDate?: string | null;
  recurring: boolean;
  description?: string | null;
  createdAt: string;
}

export interface Payment {
  id: string;
  memberId: string;
  member: { id: string; firstName: string; lastName: string; email: string };
  feeScheduleId?: string | null;
  feeSchedule?: { id: string; name: string; type: FeeType } | null;
  amount: string;
  amountPaid: string;
  status: PaymentStatus;
  method?: PaymentMethod | null;
  receiptNumber?: string | null;
  transactionRef?: string | null;
  paidAt?: string | null;
  createdAt: string;
}

export interface PaginatedPayments {
  payments: Payment[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export interface FinancialSummary {
  totalCollected: number;
  totalOutstanding: number;
  byStatus: { status: PaymentStatus; _count: number; _sum: { amount: string | null } }[];
}

// ── Events ──────────────────────────────────────────────────────

export type EventStatus = 'DRAFT' | 'PUBLISHED' | 'CANCELLED' | 'COMPLETED';
export type AttendanceStatus = 'REGISTERED' | 'ATTENDED' | 'ABSENT' | 'CANCELLED';

export interface ClubEvent {
  id: string;
  title: string;
  description?: string | null;
  location?: string | null;
  startTime: string;
  endTime: string;
  status: EventStatus;
  capacity?: number | null;
  feeAmount?: string | null;
  createdBy: { id: string; firstName: string; lastName: string };
  _count: { attendance: number };
}

export interface EventAttendanceRecord {
  id: string;
  eventId: string;
  memberId: string;
  status: AttendanceStatus;
  registeredAt: string;
  member: { id: string; firstName: string; lastName: string; email: string };
}

export interface EventDetail extends ClubEvent {
  attendance: EventAttendanceRecord[];
  postEventReport?: {
    id: string;
    attendeeCount: number;
    summary: string;
    challenges?: string | null;
    recommendations?: string | null;
  } | null;
}

// ── Communication ───────────────────────────────────────────────

export type NotificationType =
  | 'ANNOUNCEMENT'
  | 'REMINDER'
  | 'FINANCIAL_ALERT'
  | 'EVENT_UPDATE'
  | 'DIRECT_MESSAGE';

export interface Notification {
  id: string;
  title: string;
  body: string;
  type: NotificationType;
  createdAt: string;
}

export interface SentNotification extends Notification {
  _count: { recipients: number };
}

export interface InboxItem {
  id: string;
  notificationId: string;
  readAt?: string | null;
  deliveredAt: string;
  notification: Notification;
}

// ── Reporting ───────────────────────────────────────────────────

export interface MembershipReport {
  total: number;
  byStatus: { status: MembershipStatus; _count: number }[];
  byRole: { role: Role; _count: number }[];
  growth: { month: string; count: number }[];
}

export interface FinancialReportData {
  totalCollected: number;
  totalOutstanding: number;
  byStatus: { status: PaymentStatus; _count: number; _sum: { amount: string | null } }[];
  monthlyCollected: { month: string; total: number }[];
}

export interface EventsReportData {
  byStatus: { status: EventStatus; _count: number }[];
  attendanceRates: {
    eventId: string;
    title: string;
    startTime: string;
    registered: number;
    attended: number;
    attendanceRate: number;
  }[];
}
