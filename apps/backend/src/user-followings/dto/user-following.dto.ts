import { Field, ObjectType, ID } from '@nestjs/graphql';
import { UserDto } from '../../users/dto/user.dto';
import { IUserFollowing, ApprovalStatus } from '@motorove/shared';

@ObjectType()
export class UserFollowingDto implements IUserFollowing {
  @Field(() => ID)
  id: string;

  @Field(() => UserDto, { nullable: true })
  follower?: Partial<UserDto>;

  @Field(() => UserDto, { nullable: true })
  following?: Partial<UserDto>;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field()
  status: ApprovalStatus;
}
