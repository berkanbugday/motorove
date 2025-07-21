import { InputType, Field } from '@nestjs/graphql';
import { IsEnum } from 'class-validator';
import { NotificationPermission } from '../../enums/models/notification-permission.enum';

@InputType()
export class UpdateNotificationPermissionInput {
  @Field(() => NotificationPermission)
  @IsEnum(NotificationPermission)
  notificationPermission: NotificationPermission;
}
