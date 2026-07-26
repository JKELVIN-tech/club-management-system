import prisma from '../../config/prisma';
import { AppError } from '../../middleware/errorHandler';
import { NotificationType, MembershipStatus } from '@prisma/client';

interface CreateNotificationInput {
  title: string;
  body: string;
  type?: NotificationType;
  recipientIds?: string[];
}

export async function createNotification(input: CreateNotificationInput, senderId: string) {
  // Bulk announcements (no explicit recipients) go to every active member.
  // Targeted messages go only to the listed recipientIds.
  const explicitRecipients = input.recipientIds && input.recipientIds.length > 0
    ? input.recipientIds
    : null;

  const recipientIds: string[] = explicitRecipients
    ? explicitRecipients
    : (
        await prisma.member.findMany({
          where: { status: MembershipStatus.ACTIVE },
          select: { id: true },
        })
      ).map((m: { id: string }) => m.id);

  if (recipientIds.length === 0) {
    throw new AppError('No recipients found for this notification', 422);
  }

  const notification = await prisma.notification.create({
    data: {
      title: input.title,
      body: input.body,
      type: input.type ?? NotificationType.ANNOUNCEMENT,
      senderId,
      recipients: {
        create: recipientIds.map((memberId) => ({ memberId })),
      },
    },
    include: { recipients: true },
  });

  await prisma.auditLog.create({
    data: {
      memberId: senderId,
      action: 'NOTIFICATION_SENT',
      entityType: 'Notification',
      entityId: notification.id,
      metadata: { recipientCount: recipientIds.length },
    },
  });

  return notification;
}

export async function listSentNotifications() {
  return prisma.notification.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      _count: { select: { recipients: true } },
    },
  });
}

export async function getNotificationReadStats(id: string) {
  const notification = await prisma.notification.findUnique({
    where: { id },
    include: {
      recipients: {
        include: { member: { select: { id: true, firstName: true, lastName: true } } },
      },
    },
  });
  if (!notification) throw new AppError('Notification not found', 404);

  const readCount = notification.recipients.filter((r: { readAt: Date | null }) => r.readAt).length;

  return {
    notification: {
      id: notification.id,
      title: notification.title,
      body: notification.body,
      type: notification.type,
      createdAt: notification.createdAt,
    },
    readCount,
    totalRecipients: notification.recipients.length,
    recipients: notification.recipients,
  };
}

export async function listInboxForMember(memberId: string, unreadOnly?: boolean) {
  const where: any = { memberId };
  if (unreadOnly) where.readAt = null;

  return prisma.notificationRecipient.findMany({
    where,
    include: { notification: true },
    orderBy: { deliveredAt: 'desc' },
  });
}

export async function markAsRead(memberId: string, notificationId: string) {
  const recipient = await prisma.notificationRecipient.findUnique({
    where: { notificationId_memberId: { notificationId, memberId } },
  });
  if (!recipient) throw new AppError('Notification not found in your inbox', 404);

  if (recipient.readAt) return recipient;

  return prisma.notificationRecipient.update({
    where: { id: recipient.id },
    data: { readAt: new Date() },
  });
}

export async function getUnreadCount(memberId: string) {
  return prisma.notificationRecipient.count({ where: { memberId, readAt: null } });
}
