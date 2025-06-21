import { Field, ObjectType, Int } from '@nestjs/graphql';
import { User } from '../../auth/models/user.model';

@ObjectType()
export class UserProfile extends User {
  @Field(() => Boolean)
  isFollowing: boolean;

  @Field(() => Int)
  followerCount: number;

  @Field(() => Int)
  followingCount: number;
}
