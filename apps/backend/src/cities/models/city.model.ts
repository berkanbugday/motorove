import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class City {
  @Field(() => ID)
  id: string;

  @Field()
  value: string;
}
