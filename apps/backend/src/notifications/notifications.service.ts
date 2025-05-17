import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FirebaseService } from './firebase.service';
import { NotificationType } from '../enums/models/notification-type.enum';
import { Notification } from './models/notification.model';
import { CreateNotificationInput } from './dto/create-notification.input';
import { NotificationStatus } from '../enums/models/notification-status.enum';
@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly firebaseService: FirebaseService,
  ) {}

  /**
   * Save a new device token for a user
   */
  async saveDeviceToken(
    userId: string,
    deviceToken: string,
    deviceType: 'ios' | 'android',
  ): Promise<void> {
    try {
      await this.prisma.deviceToken.upsert({
        where: {
          token_userId: {
            token: deviceToken,
            userId,
          },
        },
        update: {
          isActive: true,
          lastUsedAt: new Date(),
        },
        create: {
          token: deviceToken,
          type: deviceType,
          userId,
        },
      });
      this.logger.log(`Device token saved for user ${userId}`);
    } catch (error) {
      this.logger.error(
        `Failed to save device token for user ${userId}`,
        error,
      );
      throw error;
    }
  }

  /**
   * Remove a device token for a user
   */
  async removeDeviceToken(userId: string, deviceToken: string): Promise<void> {
    try {
      await this.prisma.deviceToken.updateMany({
        where: {
          userId,
          token: deviceToken,
        },
        data: {
          isActive: false,
        },
      });
    } catch (error) {
      this.logger.error(
        `Failed to remove device token for user ${userId}`,
        error,
      );
      throw error;
    }
  }

  /**
   * Get all device tokens for a user
   */
  async getUserDeviceTokens(userId: string): Promise<string[]> {
    try {
      const deviceTokens = await this.prisma.deviceToken.findMany({
        where: { userId, isActive: true },
        select: { token: true },
      });
      return deviceTokens.map((dt) => dt.token);
    } catch (error) {
      this.logger.error(
        `Failed to get device tokens for user ${userId}`,
        error,
      );
      throw error;
    }
  }

  /**
   * Create and send a notification
   */
  async createAndSendNotification(
    createNotificationInput: CreateNotificationInput,
    userId: string,
  ): Promise<Notification> {
    try {
      // Store notification in database
      const notification = await this.prisma.notification.create({
        data: {
          title: createNotificationInput.title,
          body: createNotificationInput.body,
          type: createNotificationInput.type,
          data: createNotificationInput.data,
          user: {
            connect: { id: createNotificationInput.userId },
          },
          status: NotificationStatus.PENDING,
          createdBy: {
            connect: { id: userId },
          },
          updatedBy: {
            connect: { id: userId },
          },
        },
      });

      // Send notification via Firebase
      const tokens = await this.getUserDeviceTokens(
        createNotificationInput.userId,
      );
      if (tokens.length) {
        try {
          await this.firebaseService.sendMulticastPushNotification(
            tokens,
            createNotificationInput.title,
            createNotificationInput.body,
            createNotificationInput.data
              ? JSON.parse(createNotificationInput.data)
              : undefined,
          );

          // Update status to sent
          await this.prisma.notification.update({
            where: { id: notification.id },
            data: {
              status: NotificationStatus.SENT,
              updatedBy: { connect: { id: userId } },
              updatedAt: new Date(),
            },
          });
        } catch (error) {
          this.logger.error(
            `Failed to send notification to user ${createNotificationInput.userId}`,
            error,
          );
          await this.prisma.notification.update({
            where: { id: notification.id },
            data: {
              status: NotificationStatus.FAILED,
              updatedBy: { connect: { id: userId } },
              updatedAt: new Date(),
            },
          });
        }
      } else {
        // Update status to failed if no tokens
        await this.prisma.notification.update({
          where: { id: notification.id },
          data: {
            status: NotificationStatus.NOT_SENT,
            updatedBy: { connect: { id: userId } },
            updatedAt: new Date(),
          },
        });
      }

      return this.mapToGraphQL(notification);
    } catch (error) {
      this.logger.error('Failed to create and send notification', error);
      throw error;
    }
  }

  /**
   * Get all notifications for a user
   */
  async findAll(
    userId: string,
    limit?: number,
    skip?: number,
  ): Promise<Notification[]> {
    try {
      const notifications = await this.prisma.notification.findMany({
        where: { userId },
        orderBy: [{ read: 'asc' }, { createdAt: 'desc' }],
        take: limit || undefined,
        skip: skip || undefined,
      });

      // Convert JSON data for GraphQL output
      return notifications.map((notification) =>
        this.mapToGraphQL(notification),
      );
    } catch (error) {
      this.logger.error(
        `Failed to get notifications for user ${userId}`,
        error,
      );
      throw error;
    }
  }

  /**
   * Mark a notification as read
   */
  async markNotificationAsRead(
    id: string,
    userId: string,
  ): Promise<Notification> {
    try {
      const notification = await this.prisma.notification.update({
        where: { id },
        data: {
          read: true,
          updatedBy: { connect: { id: userId } },
          updatedAt: new Date(),
        },
      });
      return this.mapToGraphQL(notification);
    } catch (error) {
      this.logger.error(`Failed to mark notification ${id} as read`, error);
      throw error;
    }
  }

  /**
   * Mark all notifications for a user as read
   */
  async markAllNotificationsAsRead(userId: string): Promise<Notification[]> {
    try {
      // Update notifications
      await this.prisma.notification.updateMany({
        where: { userId, read: false },
        data: { read: true, updatedById: userId, updatedAt: new Date() },
      });

      // Fetch the updated notifications
      const updatedNotifications = await this.prisma.notification.findMany({
        where: { userId, read: true },
        orderBy: { updatedAt: 'desc' },
      });

      return updatedNotifications.map((notification) =>
        this.mapToGraphQL(notification),
      );
    } catch (error) {
      this.logger.error(
        `Failed to mark all notifications as read for user ${userId}`,
        error,
      );
      throw error;
    }
  }

  /**
   * Get the count of notifications for a user
   * @param userId The user ID
   * @param onlyUnread If true, only count unread notifications
   */
  async getNotificationsCount(
    userId: string,
    onlyUnread?: boolean,
  ): Promise<number> {
    try {
      const count = await this.prisma.notification.count({
        where: {
          userId,
          ...(onlyUnread ? { read: false } : {}),
        },
      });
      return count;
    } catch (error) {
      this.logger.error(
        `Failed to get notifications count for user ${userId}`,
        error,
      );
      throw error;
    }
  }

  /**
   * Delete a notification
   */
  async deleteNotification(id: string, userId: string): Promise<Notification> {
    try {
      const notification = await this.prisma.notification.delete({
        where: { id, userId },
      });
      return this.mapToGraphQL(notification);
    } catch (error) {
      this.logger.error(`Failed to delete notification ${id}`, error);
      throw error;
    }
  }

  /**
   * Delete all notifications for a user
   */
  async deleteAllNotifications(userId: string): Promise<boolean> {
    await this.prisma.notification.deleteMany({ where: { userId } });
    return true;
  }

  /**
   * Send a notification to multiple users
   */
  async sendBulkNotifications(
    userIds: string[],
    title: string,
    body: string,
    type: NotificationType,
    data: string | Record<string, string> = {},
    createdById: string,
    updatedById: string,
  ): Promise<Notification[]> {
    try {
      // Parse string data if needed
      const parsedData =
        typeof data === 'string' && data ? JSON.parse(data) : data;

      // Prepare notification data
      const notificationData = userIds.map((userId) => ({
        title,
        body,
        type,
        data: parsedData,
        userId,
        status: NotificationStatus.PENDING,
        createdById: createdById,
        updatedById: updatedById,
      }));

      // Create notifications in database
      await this.prisma.notification.createMany({
        data: notificationData,
      });

      // Process each user
      for (const userId of userIds) {
        const tokens = await this.getUserDeviceTokens(userId);
        if (tokens.length) {
          await this.firebaseService.sendMulticastPushNotification(
            tokens,
            title,
            body,
            typeof parsedData === 'object' ? parsedData : {},
          );

          // Update status to sent
          await this.prisma.notification.updateMany({
            where: {
              userId,
              title,
              body,
              type,
              status: NotificationStatus.PENDING,
            },
            data: {
              status: NotificationStatus.SENT,
              updatedById: updatedById,
              updatedAt: new Date(),
            },
          });
        } else {
          // Update status to failed
          await this.prisma.notification.updateMany({
            where: {
              userId,
              title,
              body,
              type,
              status: NotificationStatus.PENDING,
            },
            data: {
              status: NotificationStatus.FAILED,
              updatedById: updatedById,
              updatedAt: new Date(),
            },
          });
        }
      }

      // Fetch created notifications to return
      const createdNotifications = await this.prisma.notification.findMany({
        where: {
          userId: { in: userIds },
          title,
          body,
          type,
          createdById,
        },
        orderBy: { createdAt: 'desc' },
      });

      return createdNotifications.map((notification) =>
        this.mapToGraphQL(notification),
      );
    } catch (error) {
      this.logger.error('Failed to send bulk notifications', error);
      throw error;
    }
  }

  /**
   * Map database notification to GraphQL model with string data
   */
  private mapToGraphQL(notification: any): Notification {
    return {
      ...notification,
      data: notification.data ? JSON.stringify(notification.data) : null,
    };
  }
}
