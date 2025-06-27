import { Field, ObjectType, ID } from '@nestjs/graphql';
import { User } from '../../users/models/user.model';

@ObjectType()
export class UserFollowing {
  @Field(() => ID)
  id: string;

  @Field(() => String)
  followerId: string;

  @Field(() => User)
  follower: User;

  @Field(() => String)
  followingId: string;

  @Field(() => User)
  following: User;

  @Field()
  createdAt: Date;
}
