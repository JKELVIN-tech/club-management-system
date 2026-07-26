import { body, query } from 'express-validator';

export const createFeeScheduleValidator = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('type')
    .isIn(['MEMBERSHIP_DUE', 'LEVY', 'EVENT_FEE', 'FINE', 'OTHER'])
    .withMessage('Invalid fee type'),
  body('amount').isFloat({ gt: 0 }).withMessage('Amount must be a positive number'),
  body('dueDate').optional().isISO8601().withMessage('Due date must be a valid date'),
  body('recurring').optional().isBoolean(),
  body('description').optional().trim(),
];

export const recordPaymentValidator = [
  body('memberId').isUUID().withMessage('A valid member is required'),
  body('feeScheduleId').optional().isUUID(),
  body('amount').isFloat({ gt: 0 }).withMessage('Amount must be a positive number'),
  body('amountPaid').optional().isFloat({ min: 0 }),
  body('method')
    .optional()
    .isIn(['CASH', 'MPESA', 'BANK_TRANSFER', 'CARD', 'OTHER'])
    .withMessage('Invalid payment method'),
  body('transactionRef').optional().trim(),
];

export const listPaymentsValidator = [
  query('memberId').optional().isUUID(),
  query('status')
    .optional()
    .isIn(['PENDING', 'PAID', 'PARTIAL', 'OVERDUE', 'WAIVED']),
];
