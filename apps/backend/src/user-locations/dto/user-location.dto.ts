import { Field, Float, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class UserLocationDto {
  @Field()
  id: string;

  @Field()
  userId: string;

  @Field(() => Float)
  latitude: number;

  @Field(() => Float)
  longitude: number;

  @Field()
  updatedAt: Date;

  @Field(() => Float, { nullable: true })
  routeDistanceKm?: number;

  @Field(() => Int, { nullable: true })
  routeDurationSeconds?: number;
}
