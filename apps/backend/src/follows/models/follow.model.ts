import { Field, ObjectType, ID } from '@nestjs/graphql';
import { User } from '../../users/models/user.model';

@ObjectType()
export class Follow {
  @Field(() => ID)
  id: string;

  @Field(() => User)
  follower: User;

  @Field(() => User)
  following: User;

  @Field()
  createdAt: Date;
}
