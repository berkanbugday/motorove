import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FirebaseService } from './firebase.service';
import { Notification } from './models/notification.model';
import { CreateNotificationInput } from './dto/create-notification.input';
import { NotificationStatus } from '../enums/models/notification-status.enum';
import { NotificationDto } from './dto/notification.dto';
import { plainToClass } from 'class-transformer';
import { DeviceToken } from './models/device-token.model';
import * as admin from 'firebase-admin';
import { CreateNotificationsInput } from './dto/create-notifications.input';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly firebaseService: FirebaseService,
  ) {}

  async findAll(
    limit?: number,
    skip?: number,
    userId?: string,
  ): Promise<NotificationDto[]> {
    try {
      const notifications = (await this.prisma.notification.findMany({
        where: { userId, isActive: true },
        orderBy: [{ read: 'asc' }, { createdAt: 'desc' }],
        take: limit || undefined,
        skip: skip || undefined,
      })) as unknown as Notification[];

      return await Promise.all(
        notifications.map((notification) => this.mapToDto(notification)),
      );
    } catch (error) {
      this.logger.error(
        `Failed to get notifications for user ${userId}`,
        error,
      );
      throw error;
    }
  }

  async count(userId: string): Promise<number> {
    try {
      return (await this.prisma.notification.count({
        where: { userId, read: false, isActive: true },
      })) as unknown as number;
    } catch (error) {
      this.logger.error(
        `Failed to get notifications count for user ${userId}`,
        error,
      );
      throw error;
    }
  }

  async createBulk(
    input: CreateNotificationsInput,
    userId: string,
  ): Promise<NotificationDto[]> {
    try {
      const parsedData =
        typeof input.data === 'string' && input.data
          ? (JSON.parse(input.data) as Record<string, string>)
          : input.data;

      // Prepare notification data
      const notificationData = input.userIds.map((userId) => ({
        title: input.title,
        body: input.body,
        type: input.type,
        channel: input.channels,
        data: parsedData,
        userId,
        status: NotificationStatus.PENDING,
        createdById: userId,
        updatedById: userId,
      }));

      // Create notifications in database
      await this.prisma.notification.createMany({
        data: notificationData,
      });

      // Process each user
      for (const userId of input.userIds) {
        const tokens = await this.findUserDeviceTokens(userId);
        if (tokens.length) {
          await this.firebaseService.sendMulticastPushNotification(
            tokens,
            input.title,
            input.body,
            typeof parsedData === 'object' ? parsedData : {},
          );

          // Update status to sent
          await this.prisma.notification.updateMany({
            where: {
              userId,
              title: input.title,
              body: input.body,
              type: input.type,
              status: NotificationStatus.PENDING,
            },
            data: {
              status: NotificationStatus.SENT,
              updatedById: userId,
              updatedAt: new Date(),
            },
          });
        } else {
          // Update status to failed
          await this.prisma.notification.updateMany({
            where: {
              userId,
              title: input.title,
              body: input.body,
              type: input.type,
              status: NotificationStatus.PENDING,
            },
            data: {
              status: NotificationStatus.FAILED,
              updatedById: userId,
              updatedAt: new Date(),
            },
          });
        }
      }

      // Fetch created notifications to return
      const createdNotifications = (await this.prisma.notification.findMany({
        where: {
          userId: { in: input.userIds },
          title: input.title,
          body: input.body,
          type: input.type,
          createdById: userId,
        },
        orderBy: { createdAt: 'desc' },
      })) as unknown as Notification[];

      return await Promise.all(
        createdNotifications.map((notification) => this.mapToDto(notification)),
      );
    } catch (error) {
      this.logger.error('Failed to create and send notifications', error);
      throw error;
    }
  }

  async create(
    input: CreateNotificationInput,
    userId: string,
  ): Promise<NotificationDto> {
    try {
      const createdNotification = (await this.prisma.notification.create({
        data: {
          title: input.title,
          body: input.body,
          type: input.type,
          channel: input.channel,
          data: input.data,
          user: {
            connect: { id: input.userId },
          },
          status: NotificationStatus.PENDING,
          createdBy: {
            connect: { id: userId },
          },
          updatedBy: {
            connect: { id: userId },
          },
        },
      })) as unknown as Notification;

      const tokens = await this.findUserDeviceTokens(input.userId);
      if (tokens.length) {
        try {
          const result =
            (await this.firebaseService.sendMulticastPushNotification(
              tokens,
              input.title,
              input.body,
              input.data
                ? (JSON.parse(input.data) as Record<string, string>)
                : undefined,
            )) as unknown as admin.messaging.BatchResponse;

          if (result.successCount > 0) {
            await this.prisma.notification.update({
              where: { id: createdNotification.id },
              data: {
                status: NotificationStatus.SENT,
                updatedBy: { connect: { id: userId } },
                updatedAt: new Date(),
              },
            });
          }
        } catch (error) {
          this.logger.error(
            `Failed to send notification to user ${input.userId}`,
            error,
          );
          await this.prisma.notification.update({
            where: { id: createdNotification.id },
            data: {
              status: NotificationStatus.FAILED,
              updatedBy: { connect: { id: userId } },
              updatedAt: new Date(),
            },
          });
        }
      } else {
        await this.prisma.notification.update({
          where: { id: createdNotification.id },
          data: {
            status: NotificationStatus.NOT_SENT,
            updatedBy: { connect: { id: userId } },
            updatedAt: new Date(),
          },
        });
      }

      return this.mapToDto(createdNotification);
    } catch (error) {
      this.logger.error('Failed to create and send notification', error);
      throw error;
    }
  }

  async markAllAsRead(userId: string): Promise<NotificationDto[]> {
    try {
      const updatedNotifications =
        (await this.prisma.notification.updateManyAndReturn({
          where: { userId, read: false },
          data: { read: true, updatedById: userId, updatedAt: new Date() },
        })) as unknown as Notification[];

      return await Promise.all(
        updatedNotifications.map((notification) => this.mapToDto(notification)),
      );
    } catch (error) {
      this.logger.error(
        `Failed to mark all notifications as read for user ${userId}`,
        error,
      );
      throw error;
    }
  }

  async markAsRead(id: string, userId: string): Promise<NotificationDto> {
    try {
      const notification = (await this.prisma.notification.update({
        where: { id },
        data: {
          read: true,
          updatedBy: { connect: { id: userId } },
          updatedAt: new Date(),
        },
      })) as unknown as Notification;
      return this.mapToDto(notification);
    } catch (error) {
      this.logger.error(`Failed to mark notification ${id} as read`, error);
      throw error;
    }
  }

  async deleteAll(userId: string): Promise<NotificationDto[]> {
    try {
      const updatedNotifications =
        (await this.prisma.notification.updateManyAndReturn({
          where: { userId, isActive: true },
          data: { isActive: false, updatedById: userId, updatedAt: new Date() },
        })) as unknown as Notification[];

      return await Promise.all(
        updatedNotifications.map((notification) => this.mapToDto(notification)),
      );
    } catch (error) {
      this.logger.error(
        `Failed to delete all notifications for user ${userId}`,
        error,
      );
      throw error;
    }
  }

  async delete(id: string, userId: string): Promise<NotificationDto> {
    try {
      const notification = (await this.prisma.notification.update({
        where: { id, userId, isActive: true },
        data: { isActive: false, updatedById: userId, updatedAt: new Date() },
      })) as unknown as Notification;

      return this.mapToDto(notification);
    } catch (error) {
      this.logger.error(`Failed to delete notification ${id}`, error);
      throw error;
    }
  }

  async findUserDeviceTokens(userId: string): Promise<string[]> {
    try {
      const deviceTokens = (await this.prisma.deviceToken.findMany({
        where: { userId, isActive: true },
        select: { token: true },
      })) as unknown as DeviceToken[];

      return deviceTokens.map((dt) => dt.token);
    } catch (error) {
      this.logger.error(
        `Failed to get device tokens for user ${userId}`,
        error,
      );
      throw error;
    }
  }

  async saveDeviceToken(
    userId: string,
    deviceToken: string,
    deviceType: 'ios' | 'android',
  ): Promise<boolean> {
    try {
      const savedDeviceToken = (await this.prisma.deviceToken.upsert({
        where: { userId },
        update: {
          isActive: true,
          lastUsedAt: new Date(),
        },
        create: {
          token: deviceToken,
          type: deviceType,
          userId,
        },
      })) as unknown as DeviceToken;

      return !!savedDeviceToken;
    } catch (error) {
      this.logger.error(
        `Failed to save device token for user ${userId}`,
        error,
      );
      throw error;
    }
  }

  async removeDeviceToken(
    userId: string,
    deviceToken: string,
  ): Promise<boolean> {
    try {
      const removedDeviceToken = (await this.prisma.deviceToken.updateMany({
        where: {
          userId,
          token: deviceToken,
        },
        data: {
          isActive: false,
        },
      })) as unknown as DeviceToken[];

      return removedDeviceToken.length > 0;
    } catch (error) {
      this.logger.error(
        `Failed to remove device token for user ${userId}`,
        error,
      );
      throw error;
    }
  }

  private mapToDto(notification: Notification): NotificationDto {
    return plainToClass(NotificationDto, {
      ...notification,
      data: notification.data ? JSON.stringify(notification.data) : undefined,
    });
  }
}
