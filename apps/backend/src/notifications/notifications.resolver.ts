import {
  Args,
  Context,
  ID,
  Int,
  Mutation,
  Query,
  Resolver,
} from '@nestjs/graphql';
import { NotificationsService } from './notifications.service';
import { Notification } from './models/notification.model';
import { CreateNotificationInput } from './dto/create-notification.input';
import { UseGuards } from '@nestjs/common';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { DeviceTokenInput } from './dto/device-token.input';
import { SendBulkNotificationInput } from './dto/send-bulk-notification.input';

interface GqlContext {
  req: Request & {
    user: { id: string };
    headers: { authorization?: string };
  };
}

@Resolver(() => Notification)
export class NotificationsResolver {
  constructor(private readonly notificationsService: NotificationsService) {}

  @UseGuards(JwtGuard)
  @Query(() => [Notification], { name: 'notifications' })
  async findAll(
    @Context() context: GqlContext,
    @Args('limit', { type: () => Int, nullable: true }) limit?: number,
    @Args('skip', { type: () => Int, nullable: true }) skip?: number,
  ): Promise<Notification[]> {
    const userId = context.req.user.id;
    return this.notificationsService.findAll(userId, limit, skip);
  }

  @UseGuards(JwtGuard)
  @Mutation(() => Notification)
  async createNotification(
    @Args('createNotificationInput')
    createNotificationInput: CreateNotificationInput,
    @Context() context: GqlContext,
  ): Promise<Notification> {
    const userId = context.req.user.id;
    // Send as-is - the service will handle the JSON parsing internally
    return this.notificationsService.createAndSendNotification(
      createNotificationInput,
      userId,
    );
  }

  @UseGuards(JwtGuard)
  @Mutation(() => Notification)
  async markNotificationAsRead(
    @Args('id', { type: () => ID }) id: string,
    @Context() context: GqlContext,
  ): Promise<Notification> {
    const userId = context.req.user.id;
    return this.notificationsService.markNotificationAsRead(id, userId);
  }

  @UseGuards(JwtGuard)
  @Mutation(() => [Notification])
  async markAllNotificationsAsRead(
    @Args('userId', { type: () => String }) userId: string,
  ): Promise<Notification[]> {
    return this.notificationsService.markAllNotificationsAsRead(userId);
  }

  @UseGuards(JwtGuard)
  @Mutation(() => Notification)
  async deleteNotification(
    @Context() context: GqlContext,
    @Args('id', { type: () => ID }) id: string,
  ): Promise<Notification> {
    const userId = context.req.user.id;
    return this.notificationsService.deleteNotification(id, userId);
  }

  @UseGuards(JwtGuard)
  @Mutation(() => Boolean)
  async saveDeviceToken(
    @Args('deviceTokenInput') deviceTokenInput: DeviceTokenInput,
  ): Promise<boolean> {
    await this.notificationsService.saveDeviceToken(
      deviceTokenInput.userId,
      deviceTokenInput.token,
      deviceTokenInput.deviceType as 'ios' | 'android',
    );
    return true;
  }

  @UseGuards(JwtGuard)
  @Mutation(() => Boolean)
  async removeDeviceToken(
    @Args('userId') userId: string,
    @Args('token') token: string,
  ): Promise<boolean> {
    await this.notificationsService.removeDeviceToken(userId, token);
    return true;
  }

  @UseGuards(JwtGuard)
  @Mutation(() => Boolean)
  async sendBulkNotifications(
    @Args('sendBulkNotificationInput')
    sendBulkNotificationInput: SendBulkNotificationInput,
    @Context() context: GqlContext,
  ): Promise<boolean> {
    const userId = context.req.user.id;
    // Let the service handle JSON parsing
    await this.notificationsService.sendBulkNotifications(
      sendBulkNotificationInput.userIds,
      sendBulkNotificationInput.title,
      sendBulkNotificationInput.body,
      sendBulkNotificationInput.type,
      sendBulkNotificationInput.data,
      userId,
      userId,
    );
    return true;
  }
}
