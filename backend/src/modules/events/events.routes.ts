import { Router } from 'express';
import * as controller from './events.controller';
import { createEventValidator, updateEventValidator, createReportValidator } from './events.validators';
import { authenticate, authorize } from '../../middleware/auth';
import { Role } from '@prisma/client';

const router = Router();

router.use(authenticate);

// Anyone authenticated can browse events (members see published-only,
// enforced in the controller) and RSVP
router.get('/', controller.list);
router.get('/:id', controller.getById);
router.post('/:id/register', controller.register);
router.delete('/:id/register', controller.cancelMyRegistration);

// Admin/Secretary manage the event lifecycle
router.post('/', authorize(Role.ADMIN, Role.SECRETARY), createEventValidator, controller.create);
router.patch('/:id', authorize(Role.ADMIN, Role.SECRETARY), updateEventValidator, controller.update);
router.post('/:id/publish', authorize(Role.ADMIN, Role.SECRETARY), controller.publish);
router.post('/:id/cancel', authorize(Role.ADMIN, Role.SECRETARY), controller.cancel);
router.delete('/:id', authorize(Role.ADMIN, Role.SECRETARY), controller.remove);

router.post('/:id/attendance', authorize(Role.ADMIN, Role.SECRETARY), controller.markAttendance);
router.post(
  '/:id/report',
  authorize(Role.ADMIN, Role.SECRETARY),
  createReportValidator,
  controller.createReport
);

export default router;
