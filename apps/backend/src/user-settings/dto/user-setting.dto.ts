import { ObjectType, Field } from '@nestjs/graphql';
import { IsBoolean, IsOptional, IsEnum } from 'class-validator';
import { GraphQLJSON } from 'graphql-type-json';
import { NotificationPermission } from '../../enums/models/notification-permission.enum';
import { NotificationType } from '../../enums/models/notification-type.enum';
import { IUserSetting } from '@motorove/shared';

@ObjectType()
export class UserSettingDto implements IUserSetting {
  @Field(() => Boolean)
  @IsBoolean()
  autoAcceptFollowers: boolean;

  @Field(() => NotificationPermission)
  @IsEnum(NotificationPermission)
  notificationPermission: NotificationPermission;

  @Field(() => GraphQLJSON, { nullable: true })
  @IsOptional()
  notificationPreferences?: Record<NotificationType, boolean>;
}
