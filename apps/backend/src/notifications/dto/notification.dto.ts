import { Field, ID, ObjectType } from '@nestjs/graphql';
import { NotificationType } from '../../enums/models/notification-type.enum';
import { NotificationStatus } from '../../enums/models/notification-status.enum';
import { User } from '../../users/models/user.model';

@ObjectType()
export class NotificationDto {
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

  @Field(() => User)
  user: User;

  @Field(() => NotificationStatus)
  status: NotificationStatus;

  @Field()
  read: boolean;

  @Field()
  createdAt: Date;
}
