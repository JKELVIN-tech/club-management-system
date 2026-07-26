import { body } from 'express-validator';

export const createNotificationValidator = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('body').trim().notEmpty().withMessage('Message body is required'),
  body('type')
    .optional()
    .isIn(['ANNOUNCEMENT', 'REMINDER', 'FINANCIAL_ALERT', 'EVENT_UPDATE', 'DIRECT_MESSAGE'])
    .withMessage('Invalid notification type'),
  body('recipientIds')
    .optional()
    .isArray()
    .withMessage('recipientIds must be an array of member IDs'),
  body('recipientIds.*').optional().isUUID(),
];
