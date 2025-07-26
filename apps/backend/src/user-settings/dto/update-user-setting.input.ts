import { InputType, Field, ID } from '@nestjs/graphql';
import { IsBoolean, IsOptional, IsEnum, IsUUID } from 'class-validator';
import { GraphQLJSON } from 'graphql-type-json';
import { NotificationPermission } from '../../enums/models/notification-permission.enum';
import { NotificationType } from '../../enums/models/notification-type.enum';
import { IUpdateUserSetting } from '@motorove/shared';

@InputType()
export class UpdateUserSettingInput implements IUpdateUserSetting {
  @Field(() => ID)
  @IsUUID()
  id: string;

  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  @IsBoolean()
  autoAcceptFollowers?: boolean;

  @Field(() => NotificationPermission, { nullable: true })
  @IsOptional()
  @IsEnum(NotificationPermission)
  notificationPermission?: NotificationPermission;

  @Field(() => GraphQLJSON, { nullable: true })
  @IsOptional()
  notificationPreferences?: Record<NotificationType, boolean>;
}
