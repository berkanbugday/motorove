import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType()
export class GroupTag {
  @Field(() => ID)
  id: string;

  @Field()
  value: string;

  @Field(() => Boolean)
  isActive: boolean;
}
