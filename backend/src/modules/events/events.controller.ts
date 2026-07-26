import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { asyncHandler } from '../../utils/asyncHandler';
import { AppError } from '../../middleware/errorHandler';
import * as eventsService from './events.service';
import { EventStatus, AttendanceStatus } from '@prisma/client';

export const create = asyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });

  const event = await eventsService.createEvent(req.body, req.user!.memberId);
  res.status(201).json({ event });
});

export const list = asyncHandler(async (req: Request, res: Response) => {
  const { status, upcoming } = req.query;

  // Regular members only ever see published events; officials can filter
  // by any status (e.g. to review drafts).
  const isPrivileged = ['ADMIN', 'SECRETARY'].includes(req.user!.role);
  const resolvedStatus = isPrivileged ? (status as EventStatus | undefined) : EventStatus.PUBLISHED;

  const events = await eventsService.listEvents({
    status: resolvedStatus,
    upcoming: upcoming === 'true',
  });
  res.json({ events });
});

export const getById = asyncHandler(async (req: Request, res: Response) => {
  const event = await eventsService.getEventById(req.params.id);
  res.json({ event });
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });

  const event = await eventsService.updateEvent(req.params.id, req.body);
  res.json({ event });
});

export const publish = asyncHandler(async (req: Request, res: Response) => {
  const event = await eventsService.setEventStatus(req.params.id, EventStatus.PUBLISHED);
  res.json({ event });
});

export const cancel = asyncHandler(async (req: Request, res: Response) => {
  const event = await eventsService.setEventStatus(req.params.id, EventStatus.CANCELLED);
  res.json({ event });
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  await eventsService.deleteEvent(req.params.id);
  res.status(204).send();
});

export const register = asyncHandler(async (req: Request, res: Response) => {
  const attendance = await eventsService.registerForEvent(req.params.id, req.user!.memberId);
  res.status(201).json({ attendance });
});

export const cancelMyRegistration = asyncHandler(async (req: Request, res: Response) => {
  const attendance = await eventsService.cancelRegistration(req.params.id, req.user!.memberId);
  res.json({ attendance });
});

export const markAttendance = asyncHandler(async (req: Request, res: Response) => {
  const { memberId, status } = req.body;
  if (!Object.values(AttendanceStatus).includes(status)) {
    throw new AppError('Invalid attendance status', 422);
  }
  const attendance = await eventsService.markAttendance(req.params.id, memberId, status);
  res.json({ attendance });
});

export const createReport = asyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });

  const report = await eventsService.createEventReport(req.params.id, req.body);
  res.status(201).json({ report });
});
