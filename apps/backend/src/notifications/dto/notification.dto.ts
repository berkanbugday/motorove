import { Field, ID, ObjectType } from '@nestjs/graphql';
import { NotificationType } from '../../enums/models/notification-type.enum';
import { NotificationStatus } from '../../enums/models/notification-status.enum';
import { INotification } from '@motorove/shared';

@ObjectType()
export class NotificationDto implements INotification {
  @Field(() => ID)
  id: string;

  @Field()
  title: string;

  @Field()
  body: string;

  @Field(() => NotificationType)
  type: NotificationType;

  @Field(() => String, { nullable: true })
  data?: string;

  @Field(() => NotificationStatus)
  status: NotificationStatus;

  @Field()
  read: boolean;

  @Field()
  createdAt: Date;
}
