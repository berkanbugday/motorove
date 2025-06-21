import { Resolver, Mutation, Query, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../auth/models/user.model';
import { FollowersService } from './followers.service';
import { Follower } from './models/follower.model';
import { FollowUserInput } from './dto/follow-user.dto';
import { JwtGuard } from '../auth/guards/jwt.guard';

@Resolver(() => User)
export class FollowersResolver {
  constructor(private followersService: FollowersService) {}

  @UseGuards(JwtGuard)
  @Mutation(() => Follower)
  async followUser(
    @CurrentUser() user: User,
    @Args('input') input: FollowUserInput,
  ) {
    return this.followersService.followUser(user.id, input.userId);
  }

  @UseGuards(JwtGuard)
  @Mutation(() => Boolean)
  async unfollowUser(
    @CurrentUser() user: User,
    @Args('input') input: FollowUserInput,
  ) {
    await this.followersService.unfollowUser(user.id, input.userId);
    return true;
  }

  @UseGuards(JwtGuard)
  @Query(() => [User])
  async myFollowers(@CurrentUser() user: User) {
    return this.followersService.getUserFollowers(user.id);
  }

  @UseGuards(JwtGuard)
  @Query(() => [User])
  async myFollowing(@CurrentUser() user: User) {
    return this.followersService.getUserFollowing(user.id);
  }

  @UseGuards(JwtGuard)
  @Query(() => [User])
  async userFollowers(@Args('userId') userId: string) {
    return this.followersService.getUserFollowers(userId);
  }

  @UseGuards(JwtGuard)
  @Query(() => [User])
  async userFollowing(@Args('userId') userId: string) {
    return this.followersService.getUserFollowing(userId);
  }

  @UseGuards(JwtGuard)
  @Query(() => Boolean)
  async isFollowing(@CurrentUser() user: User, @Args('userId') userId: string) {
    return this.followersService.isFollowing(user.id, userId);
  }
}
