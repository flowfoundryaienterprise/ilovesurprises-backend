import { prisma } from '../lib/prisma';
import { UserNotificationDTO } from '../types/notification.types';

export class NotificationService {
  async getUserNotifications(userId: string): Promise<{ notifications: UserNotificationDTO[]; unreadCount: number }> {
    const [notifications, unreadCount] = await Promise.all([
      prisma.userNotification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 50,
      }),
      prisma.userNotification.count({
        where: { userId, isRead: false },
      }),
    ]);

    return {
      notifications: notifications.map((n) => ({
        id: n.id,
        userId: n.userId,
        title: n.title,
        message: n.message,
        type: n.type,
        isRead: n.isRead,
        actionUrl: n.actionUrl,
        metadata: n.metadata,
        createdAt: n.createdAt,
      })),
      unreadCount,
    };
  }

  async markAsRead(id: string, userId: string): Promise<void> {
    await prisma.userNotification.updateMany({
      where: { id, userId },
      data: { isRead: true },
    });
  }

  async markAllAsRead(userId: string): Promise<void> {
    await prisma.userNotification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  }

  async createNotification(data: {
    userId: string;
    title: string;
    message: string;
    type: 'ORDER' | 'PAYMENT' | 'APPRAISAL' | 'AFFILIATE' | 'VIP' | 'SYSTEM';
    actionUrl?: string;
    metadata?: any;
  }): Promise<UserNotificationDTO> {
    const n = await prisma.userNotification.create({
      data: {
        userId: data.userId,
        title: data.title,
        message: data.message,
        type: data.type,
        actionUrl: data.actionUrl || null,
        metadata: data.metadata || null,
      },
    });

    return {
      id: n.id,
      userId: n.userId,
      title: n.title,
      message: n.message,
      type: n.type,
      isRead: n.isRead,
      actionUrl: n.actionUrl,
      metadata: n.metadata,
      createdAt: n.createdAt,
    };
  }
}

export const notificationService = new NotificationService();
