import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class AuthUser {
  @Field(() => ID)
  id: string;

  @Field()
  firstName: string;

  @Field()
  lastName: string;

  @Field()
  email: string;

  @Field(() => Boolean, { defaultValue: false })
  hasCompletedSetup: boolean;
}
