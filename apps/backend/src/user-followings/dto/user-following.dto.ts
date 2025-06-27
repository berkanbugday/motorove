import { Field, ObjectType, ID } from '@nestjs/graphql';
import { UserDto } from '../../users/dto/user.dto';

@ObjectType()
export class UserFollowingDto {
  @Field(() => ID)
  id: string;

  @Field(() => UserDto)
  follower: UserDto;

  @Field(() => UserDto)
  following: UserDto;

  @Field()
  createdAt: Date;
}
