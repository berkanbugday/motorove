import { Args, ID, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { NotificationsService } from './notifications.service';
import { CreateNotificationInput } from './dto/create-notification.input';
import { UseGuards } from '@nestjs/common';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { CreateNotificationsInput } from './dto/create-notifications.input';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/models/user.model';
import { NotificationDto } from './dto/notification.dto';
import { CreateDeviceTokenInput } from './dto/create-device-token.input';

@Resolver(() => NotificationDto)
export class NotificationsResolver {
  constructor(private readonly notificationsService: NotificationsService) {}

  @UseGuards(JwtGuard)
  @Query(() => [NotificationDto], { name: 'notifications' })
  async findAll(
    @CurrentUser() user: User,
    @Args('limit', { type: () => Int, nullable: true }) limit?: number,
    @Args('skip', { type: () => Int, nullable: true }) skip?: number,
  ): Promise<NotificationDto[]> {
    return await this.notificationsService.findAll(limit, skip, user.id);
  }

  @UseGuards(JwtGuard)
  @Query(() => Number)
  async count(@CurrentUser() user: User): Promise<number> {
    return await this.notificationsService.count(user.id);
  }

  @UseGuards(JwtGuard)
  @Mutation(() => Boolean)
  async createBulkNotifications(
    @Args('input')
    input: CreateNotificationsInput,
    @CurrentUser() user: User,
  ): Promise<NotificationDto[]> {
    return await this.notificationsService.createBulk(input, user.id);
  }

  @UseGuards(JwtGuard)
  @Mutation(() => NotificationDto)
  async createNotification(
    @Args('input')
    input: CreateNotificationInput,
    @CurrentUser() user: User,
  ): Promise<NotificationDto> {
    return await this.notificationsService.create(input, user.id);
  }

  @UseGuards(JwtGuard)
  @Mutation(() => [NotificationDto])
  async markAllNotificationsAsRead(
    @CurrentUser() user: User,
  ): Promise<NotificationDto[]> {
    return await this.notificationsService.markAllAsRead(user.id);
  }

  @UseGuards(JwtGuard)
  @Mutation(() => NotificationDto)
  async markNotificationAsRead(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: User,
  ): Promise<NotificationDto> {
    return await this.notificationsService.markAsRead(id, user.id);
  }

  @UseGuards(JwtGuard)
  @Mutation(() => [NotificationDto])
  async deleteAllNotifications(
    @CurrentUser() user: User,
  ): Promise<NotificationDto[]> {
    return await this.notificationsService.deleteAll(user.id);
  }

  @UseGuards(JwtGuard)
  @Mutation(() => NotificationDto)
  async deleteNotification(
    @CurrentUser() user: User,
    @Args('id', { type: () => ID }) id: string,
  ): Promise<NotificationDto> {
    return await this.notificationsService.delete(id, user.id);
  }

  @UseGuards(JwtGuard)
  @Mutation(() => Boolean)
  async saveDeviceToken(
    @CurrentUser() user: User,
    @Args('input') input: CreateDeviceTokenInput,
  ): Promise<boolean> {
    return await this.notificationsService.saveDeviceToken(
      user.id,
      input.token,
      input.deviceType as 'ios' | 'android',
    );
  }

  @UseGuards(JwtGuard)
  @Mutation(() => Boolean)
  async removeDeviceToken(@CurrentUser() user: User): Promise<boolean> {
    return await this.notificationsService.removeDeviceToken(user.id);
  }
}
