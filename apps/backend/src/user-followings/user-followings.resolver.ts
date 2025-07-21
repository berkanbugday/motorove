import { Resolver, Mutation, Query, Args, Int, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/models/user.model';
import { UserFollowingsService } from './user-followings.service';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { UserDto } from 'src/users/dto/user.dto';
import { UserFollowingDto } from './dto/user-following.dto';

@Resolver(() => UserFollowingDto)
export class UserFollowingsResolver {
  constructor(private userFollowingsService: UserFollowingsService) {}

  @UseGuards(JwtGuard)
  @Query(() => [UserDto], { name: 'followerUsers' })
  async findFollowerUsers(
    @Args('userId', { type: () => ID }) userId: string,
    @Args('limit', { type: () => Int, nullable: true }) limit?: number,
    @Args('skip', { type: () => Int, nullable: true }) skip?: number,
  ): Promise<UserFollowingDto[]> {
    return await this.userFollowingsService.findFollowerUsers(
      userId,
      limit,
      skip,
    );
  }

  @UseGuards(JwtGuard)
  @Query(() => [UserDto], { name: 'followingUsers' })
  async findFollowingUsers(
    @Args('userId', { type: () => ID }) userId: string,
    @Args('limit', { type: () => Int, nullable: true }) limit?: number,
    @Args('skip', { type: () => Int, nullable: true }) skip?: number,
  ): Promise<UserFollowingDto[]> {
    return await this.userFollowingsService.findFollowingUsers(
      userId,
      limit,
      skip,
    );
  }

  @UseGuards(JwtGuard)
  @Mutation(() => UserFollowingDto)
  async followUser(
    @CurrentUser() user: User,
    @Args('userId', { type: () => ID }) userId: string,
  ): Promise<UserFollowingDto> {
    return await this.userFollowingsService.follow(user.id, userId);
  }

  @UseGuards(JwtGuard)
  @Mutation(() => UserFollowingDto)
  async unfollowUser(
    @CurrentUser() user: User,
    @Args('userId', { type: () => ID }) userId: string,
  ): Promise<UserFollowingDto> {
    return await this.userFollowingsService.unfollow(user.id, userId);
  }

  @UseGuards(JwtGuard)
  @Query(() => Boolean)
  async isFollowing(
    @CurrentUser() user: User,
    @Args('userId', { type: () => ID }) userId: string,
  ): Promise<boolean> {
    return await this.userFollowingsService.isFollowing(user.id, userId);
  }
}
