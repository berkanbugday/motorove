import { Field, ObjectType, ID } from '@nestjs/graphql';
import { UserDto } from '../../users/dto/user.dto';
import { IUserFollowing } from '@motorove/shared';

@ObjectType()
export class UserFollowingDto implements IUserFollowing {
  @Field(() => ID)
  id: string;

  @Field(() => UserDto)
  follower: Partial<UserDto>;

  @Field(() => UserDto)
  following: Partial<UserDto>;

  @Field()
  createdAt: Date;
}
