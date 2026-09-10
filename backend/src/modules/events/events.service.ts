import prisma from '../../config/prisma';
import { AppError } from '../../middleware/errorHandler';
import { EventStatus, AttendanceStatus } from '@prisma/client';

const EVENT_INCLUDE = {
  createdBy: { select: { id: true, firstName: true, lastName: true } },
  _count: { select: { attendance: true } },
} as const;

interface CreateEventInput {
  title: string;
  description?: string;
  location?: string;
  startTime: string;
  endTime: string;
  capacity?: number;
  feeAmount?: number;
}

export async function createEvent(input: CreateEventInput, createdById: string) {
  if (new Date(input.endTime) <= new Date(input.startTime)) {
    throw new AppError('Event end time must be after the start time', 422);
  }

  return prisma.event.create({
    data: {
      title: input.title,
      description: input.description,
      location: input.location,
      startTime: new Date(input.startTime),
      endTime: new Date(input.endTime),
      capacity: input.capacity,
      feeAmount: input.feeAmount,
      createdById,
      status: EventStatus.DRAFT,
    },
    include: EVENT_INCLUDE,
  });
}

interface ListEventsFilters {
  status?: EventStatus;
  upcoming?: boolean;
}

export async function listEvents(filters: ListEventsFilters) {
  const where: any = {};
  if (filters.status) where.status = filters.status;
  if (filters.upcoming) where.startTime = { gte: new Date() };

  return prisma.event.findMany({
    where,
    include: EVENT_INCLUDE,
    orderBy: { startTime: 'asc' },
  });
}

export async function getEventById(id: string, canViewPrivateDetails = false) {
  const event = await prisma.event.findUnique({
    where: { id },
    include: {
      ...EVENT_INCLUDE,
      attendance: canViewPrivateDetails
        ? {
            include: {
              member: { select: { id: true, firstName: true, lastName: true } },
            },
          }
        : false,
      postEventReport: true,
    },
  });

  if (!event) throw new AppError('Event not found', 404);

  // Do not allow ordinary members to bypass the published-event rule by
  // requesting a draft/cancelled event directly by ID.
  if (!canViewPrivateDetails && event.status !== EventStatus.PUBLISHED) {
    throw new AppError('Event not found', 404);
  }

  return event;
}

export async function updateEvent(id: string, data: Partial<CreateEventInput>) {
  const updateData: any = { ...data };
  if (data.startTime) updateData.startTime = new Date(data.startTime);
  if (data.endTime) updateData.endTime = new Date(data.endTime);

  return prisma.event.update({ where: { id }, data: updateData, include: EVENT_INCLUDE });
}

export async function setEventStatus(id: string, status: EventStatus) {
  return prisma.event.update({ where: { id }, data: { status }, include: EVENT_INCLUDE });
}

export async function deleteEvent(id: string) {
  await prisma.event.delete({ where: { id } });
}

// ── Attendance / RSVP ──────────────────────────────────────────

export async function registerForEvent(eventId: string, memberId: string) {
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: { _count: { select: { attendance: true } } },
  });
  if (!event) throw new AppError('Event not found', 404);
  if (event.status !== EventStatus.PUBLISHED) {
    throw new AppError('You can only register for published events', 400);
  }
  if (event.capacity && event._count.attendance >= event.capacity) {
    throw new AppError('This event is at full capacity', 409);
  }

  const existing = await prisma.eventAttendance.findUnique({
    where: { eventId_memberId: { eventId, memberId } },
  });
  if (existing) {
    throw new AppError('You are already registered for this event', 409);
  }

  return prisma.eventAttendance.create({
    data: { eventId, memberId, status: AttendanceStatus.REGISTERED },
  });
}

export async function cancelRegistration(eventId: string, memberId: string) {
  const attendance = await prisma.eventAttendance.findUnique({
    where: { eventId_memberId: { eventId, memberId } },
  });
  if (!attendance) throw new AppError('You are not registered for this event', 404);

  return prisma.eventAttendance.update({
    where: { id: attendance.id },
    data: { status: AttendanceStatus.CANCELLED },
  });
}

export async function markAttendance(
  eventId: string,
  memberId: string,
  status: AttendanceStatus
) {
  const attendance = await prisma.eventAttendance.findUnique({
    where: { eventId_memberId: { eventId, memberId } },
  });
  if (!attendance) throw new AppError('This member is not registered for the event', 404);

  return prisma.eventAttendance.update({
    where: { id: attendance.id },
    data: { status },
  });
}

// ── Post-event report ───────────────────────────────────────────

interface CreateReportInput {
  attendeeCount: number;
  summary: string;
  challenges?: string;
  recommendations?: string;
}

export async function createEventReport(eventId: string, input: CreateReportInput) {
  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event) throw new AppError('Event not found', 404);

  const existing = await prisma.eventReport.findUnique({ where: { eventId } });
  if (existing) throw new AppError('A report already exists for this event', 409);

  const report = await prisma.eventReport.create({
    data: { eventId, ...input },
  });

  await prisma.event.update({ where: { id: eventId }, data: { status: EventStatus.COMPLETED } });

  return report;
}
