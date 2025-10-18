import { ObjectType, Field, ID } from '@nestjs/graphql';
import { NotificationPermission } from '../../enums/models/notification-permission.enum';
import { NotificationType } from '../../enums/models/notification-type.enum';
import { GraphQLJSON } from 'graphql-type-json';
import { User } from '../../users/models/user.model';
import { Language } from '../../enums/models/language.enum';

@ObjectType()
export class UserSetting {
  @Field(() => ID)
  id: string;

  @Field(() => ID)
  userId: string;

  @Field(() => User)
  user: User;

  @Field(() => Boolean)
  autoAcceptFollowers: boolean;

  @Field(() => Language)
  preferredLanguage: Language;

  @Field(() => NotificationPermission)
  notificationPermission: NotificationPermission;

  @Field(() => GraphQLJSON, { nullable: true })
  notificationPreferences?: Record<NotificationType, boolean>;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;
}
