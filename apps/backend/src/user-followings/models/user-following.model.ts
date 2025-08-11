import { Field, ObjectType, ID } from '@nestjs/graphql';
import { User } from '../../users/models/user.model';
import { ApprovalStatus } from '../../enums/models/approval-status.enum';

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

  @Field()
  updatedAt: Date;

  @Field()
  status: ApprovalStatus;

  @Field()
  isActive: boolean;
}
