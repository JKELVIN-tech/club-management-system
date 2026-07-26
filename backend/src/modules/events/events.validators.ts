import { body } from 'express-validator';

export const createEventValidator = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('description').optional().trim(),
  body('location').optional().trim(),
  body('startTime').isISO8601().withMessage('Start time must be a valid date'),
  body('endTime').isISO8601().withMessage('End time must be a valid date'),
  body('capacity').optional().isInt({ gt: 0 }),
  body('feeAmount').optional().isFloat({ min: 0 }),
];

export const updateEventValidator = [
  body('title').optional().trim().notEmpty(),
  body('description').optional().trim(),
  body('location').optional().trim(),
  body('startTime').optional().isISO8601(),
  body('endTime').optional().isISO8601(),
  body('capacity').optional().isInt({ gt: 0 }),
  body('feeAmount').optional().isFloat({ min: 0 }),
];

export const createReportValidator = [
  body('attendeeCount').isInt({ min: 0 }).withMessage('Attendee count must be a non-negative integer'),
  body('summary').trim().notEmpty().withMessage('A summary is required'),
  body('challenges').optional().trim(),
  body('recommendations').optional().trim(),
];
