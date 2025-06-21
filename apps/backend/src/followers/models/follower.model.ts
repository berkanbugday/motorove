import { Field, ObjectType, ID } from '@nestjs/graphql';
import { User } from '../../auth/models/user.model';

@ObjectType()
export class Follower {
  @Field(() => ID)
  id: string;

  @Field(() => User)
  follower: User;

  @Field(() => User)
  following: User;

  @Field()
  createdAt: Date;
}
