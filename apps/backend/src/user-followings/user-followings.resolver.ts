import { Resolver, Mutation, Query, Args, Int, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/models/user.model';
import { UserFollowingsService } from './user-followings.service';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { UserFollowingDto } from './dto/user-following.dto';
import { ApprovalStatus } from '../enums/models/approval-status.enum';
import { UpdateUserFollowingApprovalStatusInput } from './dto/update-user-following-approval-status.input';

@Resolver(() => UserFollowingDto)
export class UserFollowingsResolver {
  constructor(private userFollowingsService: UserFollowingsService) {}

  @UseGuards(JwtGuard)
  @Query(() => [UserFollowingDto], { name: 'followerUsers' })
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
  @Query(() => [UserFollowingDto], { name: 'followingUsers' })
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
  @Query(() => [UserFollowingDto], { name: 'followRequests' })
  async findFollowRequests(
    @CurrentUser() user: User,
    @Args('limit', { type: () => Int, nullable: true }) limit?: number,
    @Args('skip', { type: () => Int, nullable: true }) skip?: number,
  ): Promise<UserFollowingDto[]> {
    return await this.userFollowingsService.findFollowRequests(
      user.id,
      limit,
      skip,
    );
  }

  @UseGuards(JwtGuard)
  @Mutation(() => ApprovalStatus)
  async followUser(
    @CurrentUser() user: User,
    @Args('userId', { type: () => ID }) userId: string,
  ): Promise<ApprovalStatus> {
    return await this.userFollowingsService.follow(user.id, userId);
  }

  @UseGuards(JwtGuard)
  @Mutation(() => ApprovalStatus)
  async unfollowUser(
    @CurrentUser() user: User,
    @Args('userId', { type: () => ID }) userId: string,
  ): Promise<ApprovalStatus> {
    return await this.userFollowingsService.unfollow(user.id, userId);
  }

  @UseGuards(JwtGuard)
  @Mutation(() => UserFollowingDto)
  async updateUserFollowingApprovalStatus(
    @Args('input') input: UpdateUserFollowingApprovalStatusInput,
  ): Promise<UserFollowingDto> {
    return await this.userFollowingsService.updateApprovalStatus(
      input.id,
      input.status,
    );
  }
}
