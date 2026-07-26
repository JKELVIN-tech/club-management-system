import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { asyncHandler } from '../../utils/asyncHandler';
import * as communicationService from './communication.service';

export const create = asyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });

  const notification = await communicationService.createNotification(req.body, req.user!.memberId);
  res.status(201).json({ notification });
});

export const listSent = asyncHandler(async (req: Request, res: Response) => {
  const notifications = await communicationService.listSentNotifications();
  res.json({ notifications });
});

export const getReadStats = asyncHandler(async (req: Request, res: Response) => {
  const data = await communicationService.getNotificationReadStats(req.params.id);
  res.json(data);
});

export const inbox = asyncHandler(async (req: Request, res: Response) => {
  const unreadOnly = req.query.unreadOnly === 'true';
  const items = await communicationService.listInboxForMember(req.user!.memberId, unreadOnly);
  res.json({ items });
});

export const markRead = asyncHandler(async (req: Request, res: Response) => {
  const recipient = await communicationService.markAsRead(req.user!.memberId, req.params.id);
  res.json({ recipient });
});

export const unreadCount = asyncHandler(async (req: Request, res: Response) => {
  const count = await communicationService.getUnreadCount(req.user!.memberId);
  res.json({ count });
});
