import { Resolver, Mutation, Query, Args, Int } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../auth/models/user.model';
import { FollowsService } from './follows.service';
import { Follow } from './models/follow.model';
import { FollowUserInput } from './dto/follow-user.dto';
import { JwtGuard } from '../auth/guards/jwt.guard';

@Resolver(() => User)
export class FollowsResolver {
  constructor(private followsService: FollowsService) {}

  @UseGuards(JwtGuard)
  @Mutation(() => Follow)
  async followUser(
    @CurrentUser() user: User,
    @Args('followUserInput') input: FollowUserInput,
  ) {
    return this.followsService.followUser(user.id, input.userId);
  }

  @UseGuards(JwtGuard)
  @Mutation(() => Follow)
  async unfollowUser(
    @CurrentUser() user: User,
    @Args('unFollowUserInput') input: FollowUserInput,
  ) {
    return this.followsService.unfollowUser(user.id, input.userId);
  }

  @UseGuards(JwtGuard)
  @Query(() => [User])
  async myFollowers(
    @CurrentUser() user: User,
    @Args('limit', { type: () => Int, nullable: true }) limit?: number,
    @Args('skip', { type: () => Int, nullable: true }) skip?: number,
  ) {
    return this.followsService.getUserFollowers(user.id, limit, skip);
  }

  @UseGuards(JwtGuard)
  @Query(() => [User])
  async myFollowing(
    @CurrentUser() user: User,
    @Args('limit', { type: () => Int, nullable: true }) limit?: number,
    @Args('skip', { type: () => Int, nullable: true }) skip?: number,
  ) {
    return this.followsService.getUserFollowing(user.id, limit, skip);
  }

  @UseGuards(JwtGuard)
  @Query(() => [User])
  async userFollowers(
    @Args('userId') userId: string,
    @Args('limit', { type: () => Int, nullable: true }) limit?: number,
    @Args('skip', { type: () => Int, nullable: true }) skip?: number,
  ) {
    return this.followsService.getUserFollowers(userId, limit, skip);
  }

  @UseGuards(JwtGuard)
  @Query(() => [User])
  async userFollowing(
    @Args('userId') userId: string,
    @Args('limit', { type: () => Int, nullable: true }) limit?: number,
    @Args('skip', { type: () => Int, nullable: true }) skip?: number,
  ) {
    return this.followsService.getUserFollowing(userId, limit, skip);
  }

  @UseGuards(JwtGuard)
  @Query(() => Boolean)
  async isFollowing(@CurrentUser() user: User, @Args('userId') userId: string) {
    return this.followsService.isFollowing(user.id, userId);
  }
}
