import { Router } from 'express';
import * as controller from './communication.controller';
import { createNotificationValidator } from './communication.validators';
import { authenticate, authorize } from '../../middleware/auth';
import { Role } from '@prisma/client';

const router = Router();

router.use(authenticate);

// Every member has an inbox
router.get('/inbox', controller.inbox);
router.get('/inbox/unread-count', controller.unreadCount);
router.patch('/inbox/:id/read', controller.markRead);

// Only officials can broadcast/send and view delivery stats
router.post(
  '/notifications',
  authorize(Role.ADMIN, Role.SECRETARY, Role.TREASURER),
  createNotificationValidator,
  controller.create
);
router.get('/notifications', authorize(Role.ADMIN, Role.SECRETARY, Role.TREASURER), controller.listSent);
router.get(
  '/notifications/:id/stats',
  authorize(Role.ADMIN, Role.SECRETARY, Role.TREASURER),
  controller.getReadStats
);

export default router;
