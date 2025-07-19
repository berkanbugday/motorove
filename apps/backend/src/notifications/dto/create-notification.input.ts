import { Field, InputType } from '@nestjs/graphql';
import {
  IsEnum,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';
import { ICreateNotification, NotificationChannel } from '@motorove/shared';
import { NotificationType } from '../../enums/models/notification-type.enum';

@InputType()
export class CreateNotificationInput implements ICreateNotification {
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
  channel: NotificationChannel;

  @Field()
  @IsNotEmpty()
  @IsString()
  userId: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsObject()
  data?: string;
}
