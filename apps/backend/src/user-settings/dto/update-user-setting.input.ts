import { InputType, Field } from '@nestjs/graphql';
import { IsBoolean, IsOptional, IsEnum } from 'class-validator';
import { GraphQLJSON } from 'graphql-type-json';
import { NotificationPermission } from '../../enums/models/notification-permission.enum';
import { NotificationType } from '../../enums/models/notification-type.enum';
import { Language } from '../../enums/models/language.enum';
import { IUpdateUserSetting } from '@motorove/shared';

@InputType()
export class UpdateUserSettingInput implements IUpdateUserSetting {
  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  @IsBoolean()
  autoAcceptFollowers?: boolean;

  @Field(() => Language, { nullable: true })
  @IsOptional()
  @IsEnum(Language)
  preferredLanguage?: Language;

  @Field(() => NotificationPermission, { nullable: true })
  @IsOptional()
  @IsEnum(NotificationPermission)
  notificationPermission?: NotificationPermission;

  @Field(() => GraphQLJSON, { nullable: true })
  @IsOptional()
  notificationPreferences?: Record<NotificationType, boolean>;
}
