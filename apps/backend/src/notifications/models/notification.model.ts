import { Field, ObjectType } from '@nestjs/graphql';
import { NotificationType } from '../../enums/models/notification-type.enum';
import { NotificationStatus } from '../../enums/models/notification-status.enum';
import { BaseModel } from '../../core/models';
import { User } from '../../auth/models/user.model';

@ObjectType()
export class Notification extends BaseModel {
  @Field()
  title: string;

  @Field()
  body: string;

  @Field(() => NotificationType)
  type: NotificationType;

  @Field(() => String, { nullable: true })
  data: string; // Store JSON as string in GraphQL

  @Field()
  userId: string;

  @Field(() => User)
  user: User;

  @Field(() => NotificationStatus)
  status: NotificationStatus;

  @Field()
  read: boolean;
}
