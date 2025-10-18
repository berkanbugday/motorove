import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FirebaseService } from './firebase.service';
import { CreateNotificationInput } from './dto/create-notification.input';
import { NotificationStatus } from '../enums/models/notification-status.enum';
import { NotificationDto } from './dto/notification.dto';
import { plainToClass } from 'class-transformer';
import * as admin from 'firebase-admin';
import { CreateNotificationsInput } from './dto/create-notifications.input';
import { NotificationPermission } from '../enums/models/notification-permission.enum';
import { UserSetting } from 'src/user-settings/models/user-setting.model';
import { Notification } from './models/notification.model';
import { I18nService } from '../core/i18n/i18n.service';
import { Language } from '../enums/models/language.enum';

interface UserSettingValidationResult {
  userSetting?: UserSetting | null;
  shouldSendPush: boolean;
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly firebaseService: FirebaseService,
    private readonly i18nService: I18nService,
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
      return await this.prisma.notification.count({
        where: { userId, read: false, isActive: true },
      });
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
    senderUserId: string,
  ): Promise<NotificationDto[]> {
    try {
      const parsedData =
        typeof input.data === 'string' && input.data
          ? (JSON.parse(input.data) as Record<string, any>)
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
        createdById: senderUserId,
        updatedById: senderUserId,
      }));

      // Create notifications in database
      await this.prisma.notification.createMany({
        data: notificationData,
      });

      // Process each user
      for (const targetUserId of input.userIds) {
        const { userSetting, shouldSendPush: hasUserSetting } =
          await this.getUserSettingsWithValidation(targetUserId);

        if (!hasUserSetting || !userSetting) {
          const whereClause = {
            userId: targetUserId,
            title: input.title,
            body: input.body,
            type: input.type,
            status: NotificationStatus.PENDING,
          };
          await this.updateNotificationStatusBulk(
            whereClause,
            NotificationStatus.NOT_SENT,
            senderUserId,
          );
          continue;
        }

        const shouldSendPush = this.checkNotificationPermissions(
          userSetting,
          input.type,
          targetUserId,
        );

        if (!shouldSendPush) {
          const whereClause = {
            userId: targetUserId,
            title: input.title,
            body: input.body,
            type: input.type,
            status: NotificationStatus.PENDING,
          };
          await this.updateNotificationStatusBulk(
            whereClause,
            NotificationStatus.NOT_SENT,
            senderUserId,
          );
          continue;
        }

        // Send push notification if permissions allow
        const whereClause = {
          userId: targetUserId,
          title: input.title,
          body: input.body,
          type: input.type,
          status: NotificationStatus.PENDING,
        };
        await this.sendPushNotificationToUser(
          targetUserId,
          input.title,
          input.body,
          typeof parsedData === 'object' ? parsedData : {},
          null,
          senderUserId,
          whereClause,
          userSetting.preferredLanguage,
        );
      }

      // Fetch created notifications to return
      const createdNotifications = (await this.prisma.notification.findMany({
        where: {
          userId: { in: input.userIds },
          title: input.title,
          body: input.body,
          type: input.type,
          createdById: senderUserId,
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

  async createWithoutPush(
    input: CreateNotificationInput,
    senderUserId: string,
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
          status: NotificationStatus.NOT_SENT,
          createdBy: {
            connect: { id: senderUserId },
          },
          updatedBy: {
            connect: { id: senderUserId },
          },
        },
      })) as unknown as Notification;

      return this.mapToDto(createdNotification);
    } catch (error) {
      this.logger.error('Failed to create notification without push', error);
      throw error;
    }
  }

  async create(
    input: CreateNotificationInput,
    senderUserId: string,
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
            connect: { id: senderUserId },
          },
          updatedBy: {
            connect: { id: senderUserId },
          },
        },
      })) as unknown as Notification;

      const { userSetting, shouldSendPush: hasUserSetting } =
        await this.getUserSettingsWithValidation(input.userId);

      if (!hasUserSetting || !userSetting) {
        await this.updateNotificationStatus(
          createdNotification.id,
          NotificationStatus.NOT_SENT,
          senderUserId,
        );
        return this.mapToDto(createdNotification);
      }

      const shouldSendPush = this.checkNotificationPermissions(
        userSetting,
        input.type,
        input.userId,
      );

      if (!shouldSendPush) {
        await this.updateNotificationStatus(
          createdNotification.id,
          NotificationStatus.NOT_SENT,
          senderUserId,
        );
        return this.mapToDto(createdNotification);
      }

      // Send push notification if permissions allow
      const parsedData = input.data
        ? (JSON.parse(input.data) as Record<string, any>)
        : null;
      await this.sendPushNotificationToUser(
        input.userId,
        input.title,
        input.body,
        parsedData,
        createdNotification.id,
        senderUserId,
        null,
        userSetting.preferredLanguage,
      );

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

  async saveDeviceToken(
    userId: string,
    deviceToken: string,
    deviceType: 'ios' | 'android',
  ): Promise<boolean> {
    try {
      const savedDeviceToken = await this.prisma.deviceToken.upsert({
        where: { userId: userId },
        update: {
          isActive: true,
          token: deviceToken,
          type: deviceType,
          lastUsedAt: new Date(),
        },
        create: {
          token: deviceToken,
          type: deviceType,
          userId,
        },
      });

      return !!savedDeviceToken;
    } catch (error) {
      this.logger.error(
        `Failed to save device token for user ${userId}`,
        error,
      );
      throw error;
    }
  }

  async removeDeviceToken(userId: string): Promise<boolean> {
    try {
      const removedDeviceToken = await this.prisma.deviceToken.updateMany({
        where: { userId },
        data: {
          isActive: false,
        },
      });

      return removedDeviceToken.count > 0;
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
      data: notification.data ? JSON.stringify(notification.data) : null,
    });
  }

  private async getUserSettingsWithValidation(
    userId: string,
  ): Promise<UserSettingValidationResult> {
    const userSetting = (await this.prisma.userSetting.findUnique({
      where: { userId },
    })) as unknown as UserSetting;

    if (!userSetting) {
      this.logger.warn(
        `User setting not found for user ${userId}, skipping push notification`,
      );
      return { userSetting: null, shouldSendPush: false };
    }

    return { userSetting, shouldSendPush: true };
  }

  private checkNotificationPermissions(
    userSetting: UserSetting,
    notificationType: string,
    userId: string,
  ): boolean {
    const hasNotificationPermission =
      userSetting.notificationPermission === NotificationPermission.ALLOWED;
    const notificationPreferences =
      (userSetting.notificationPreferences as Record<string, boolean>) || {};
    const isNotificationTypeEnabled =
      notificationPreferences[notificationType] === true;
    const shouldSendPush =
      hasNotificationPermission && isNotificationTypeEnabled;

    this.logger.debug(`Notification permission check for user ${userId}:`, {
      hasNotificationPermission,
      isNotificationTypeEnabled,
      notificationType,
      notificationPreferences,
    });

    if (!shouldSendPush) {
      this.logger.log(
        `Push notification blocked for user ${userId}: permission=${hasNotificationPermission}, typeEnabled=${isNotificationTypeEnabled}`,
      );
    }

    return shouldSendPush;
  }

  private async updateNotificationStatus(
    notificationId: string,
    status: NotificationStatus,
    senderUserId: string,
  ): Promise<void> {
    await this.prisma.notification.update({
      where: { id: notificationId },
      data: {
        status,
        updatedBy: { connect: { id: senderUserId } },
        updatedAt: new Date(),
      },
    });
  }

  private async updateNotificationStatusBulk(
    whereClause: Record<string, any>,
    status: NotificationStatus,
    senderUserId: string,
  ): Promise<void> {
    await this.prisma.notification.updateMany({
      where: whereClause,
      data: {
        status,
        updatedById: senderUserId,
        updatedAt: new Date(),
      },
    });
  }

  private async sendPushNotificationToUser(
    userId: string,
    title: string,
    body: string,
    data: Record<string, any> | null,
    notificationId?: string | null,
    senderUserId?: string | null,
    whereClause?: Record<string, any> | null,
    preferredLanguage?: Language,
  ): Promise<void> {
    const tokens = await this.findUserDeviceTokens(userId);

    if (!tokens.length) {
      this.logger.warn(`No device tokens found for user ${userId}`);
      if (notificationId && senderUserId) {
        await this.updateNotificationStatus(
          notificationId,
          NotificationStatus.NOT_SENT,
          senderUserId,
        );
      } else if (whereClause && senderUserId) {
        await this.updateNotificationStatusBulk(
          whereClause,
          NotificationStatus.NOT_SENT,
          senderUserId,
        );
      }
      return;
    }

    try {
      console.log('preferredLanguage', preferredLanguage);
      const translatedTitle = this.i18nService.translate(
        `notifications.${title}`,
        preferredLanguage,
        data || {},
      );
      const translatedBody = this.i18nService.translate(
        `notifications.${body}`,
        preferredLanguage,
        data || {},
      );
      const result = await this.firebaseService.sendMulticastPushNotification(
        tokens,
        translatedTitle,
        translatedBody,
        data || {},
      );

      const isSuccess = notificationId
        ? (result as admin.messaging.BatchResponse).successCount > 0
        : true;

      if (isSuccess) {
        if (notificationId && senderUserId) {
          await this.updateNotificationStatus(
            notificationId,
            NotificationStatus.SENT,
            senderUserId,
          );
        } else if (whereClause && senderUserId) {
          await this.updateNotificationStatusBulk(
            whereClause,
            NotificationStatus.SENT,
            senderUserId,
          );
        }
        this.logger.log(
          `Push notification sent successfully to user ${userId}`,
        );
      } else {
        if (notificationId && senderUserId) {
          await this.updateNotificationStatus(
            notificationId,
            NotificationStatus.FAILED,
            senderUserId,
          );
        } else if (whereClause && senderUserId) {
          await this.updateNotificationStatusBulk(
            whereClause,
            NotificationStatus.FAILED,
            senderUserId,
          );
        }
        this.logger.warn(`Push notification failed to send to user ${userId}`);
      }
    } catch (error) {
      this.logger.error(`Failed to send notification to user ${userId}`, error);
      if (notificationId && senderUserId) {
        await this.updateNotificationStatus(
          notificationId,
          NotificationStatus.FAILED,
          senderUserId,
        );
      } else if (whereClause && senderUserId) {
        await this.updateNotificationStatusBulk(
          whereClause,
          NotificationStatus.FAILED,
          senderUserId,
        );
      }
    }
  }
}
