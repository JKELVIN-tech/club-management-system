import { Router } from 'express';
import * as controller from './finance.controller';
import {
  createFeeScheduleValidator,
  recordPaymentValidator,
  listPaymentsValidator,
} from './finance.validators';
import { authenticate, authorize } from '../../middleware/auth';
import { Role } from '@prisma/client';

const router = Router();

router.use(authenticate);

// Fee schedules — only Admin/Treasurer manage these
router.get('/fee-schedules', authorize(Role.ADMIN, Role.TREASURER), controller.listFeeSchedules);
router.post(
  '/fee-schedules',
  authorize(Role.ADMIN, Role.TREASURER),
  createFeeScheduleValidator,
  controller.createFeeSchedule
);
router.delete('/fee-schedules/:id', authorize(Role.ADMIN, Role.TREASURER), controller.deleteFeeSchedule);

// Payments — Admin/Treasurer record & see everyone's; Members see only their own
router.post(
  '/payments',
  authorize(Role.ADMIN, Role.TREASURER),
  recordPaymentValidator,
  controller.recordPayment
);
router.get('/payments', listPaymentsValidator, controller.listPayments);
router.get('/payments/:id/receipt', controller.getReceipt);

// Reporting views — Admin/Treasurer only
router.get('/defaulters', authorize(Role.ADMIN, Role.TREASURER), controller.getDefaulters);
router.get('/summary', authorize(Role.ADMIN, Role.TREASURER), controller.getSummary);

export default router;
