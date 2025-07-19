import { Field, ObjectType, ID } from '@nestjs/graphql';
import { NotificationChannel } from '../../enums/models/notification-channel.enum';
import { NotificationType } from '../../enums/models/notification-type.enum';

@ObjectType()
export class UserNotificationSetting {
  @Field(() => ID)
  id: string;

  @Field(() => String)
  userId: string;

  @Field(() => NotificationType)
  notificationType: NotificationType;

  @Field(() => NotificationChannel)
  channel: NotificationChannel;

  @Field(() => Boolean)
  isEnabled: boolean;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;
}
