import { Field, ObjectType, ID } from '@nestjs/graphql';
import { User } from '../../users/models/user.model';
import { InvitationStatus } from '../../enums/models/invitation-status.enum';

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
  status: InvitationStatus;

  @Field()
  isActive: boolean;
}
