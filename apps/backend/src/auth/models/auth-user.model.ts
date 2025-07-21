import { Field, ID, ObjectType } from '@nestjs/graphql';
import { NotificationPermission } from '../../enums/models/notification-permission.enum';

@ObjectType()
export class AuthUser {
  @Field(() => ID)
  id: string;

  @Field()
  firstName: string;

  @Field()
  lastName: string;

  @Field()
  email: string;

  @Field(() => String, { nullable: true })
  avatar?: string | null;

  @Field(() => Boolean, { defaultValue: false })
  hasCompletedSetup: boolean;

  @Field(() => NotificationPermission, {
    defaultValue: NotificationPermission.UNKNOWN,
  })
  notificationPermission: NotificationPermission;
}
