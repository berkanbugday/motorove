import { ObjectType, Field, ID } from '@nestjs/graphql';
import { User } from '../../users/models/user.model';

@ObjectType()
export class UserBlock {
  @Field(() => ID)
  id: string;

  @Field(() => User)
  blocker: User;

  @Field(() => User)
  blocked: User;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Boolean)
  isActive: boolean;
}
