import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
export class UserStatsDto {
  @Field(() => Int)
  postsCount: number;

  @Field(() => Int)
  eventsCount: number;

  @Field(() => Int)
  followersCount: number;

  @Field(() => Int)
  followingCount: number;
}
