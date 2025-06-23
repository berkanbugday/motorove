import { Field, ObjectType } from '@nestjs/graphql';
import { User } from '../../users/models/user.model';

@ObjectType()
export class DeviceToken {
  @Field()
  token: string;

  @Field()
  type: string;

  @Field()
  userId: string;

  @Field(() => User)
  user: User;

  @Field()
  createdAt: Date;

  @Field()
  lastUsedAt: Date;

  @Field()
  isActive: boolean;
}
