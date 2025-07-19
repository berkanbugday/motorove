import { Field, InputType } from '@nestjs/graphql';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { ICreateNotifications } from '@motorove/shared';
import { NotificationType } from '../../enums/models/notification-type.enum';
import { NotificationChannel } from '../../enums/models/notification-channel.enum';

@InputType()
export class CreateNotificationsInput implements ICreateNotifications {
  @Field(() => [String])
  @IsArray()
  @IsNotEmpty()
  userIds: string[];

  @Field()
  @IsNotEmpty()
  @IsString()
  title: string;

  @Field()
  @IsNotEmpty()
  @IsString()
  body: string;

  @Field(() => NotificationType)
  @IsNotEmpty()
  @IsEnum(NotificationType)
  type: NotificationType;

  @Field(() => NotificationChannel)
  @IsNotEmpty()
  @IsEnum(NotificationChannel)
  channels: NotificationChannel;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  data?: string;
}
