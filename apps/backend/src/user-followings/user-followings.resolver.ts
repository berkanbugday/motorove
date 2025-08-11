import {
  Resolver,
  Mutation,
  Query,
  Args,
  Int,
  ID,
  Context,
} from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/models/user.model';
import { UserFollowingsService } from './user-followings.service';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { UserFollowingDto } from './dto/user-following.dto';
import { ApprovalStatus } from '../enums/models/approval-status.enum';
import { UpdateUserFollowingApprovalStatusInput } from './dto/update-user-following-approval-status.input';

interface GqlContext {
  req: Request & {
    user: { id: string };
    headers: { authorization?: string };
  };
}

@Resolver(() => UserFollowingDto)
export class UserFollowingsResolver {
  constructor(private userFollowingsService: UserFollowingsService) {}

  @UseGuards(JwtGuard)
  @Query(() => [UserFollowingDto], { name: 'followerUsers' })
  async findFollowerUsers(
    @Context() context: GqlContext,
    @Args('userId', { type: () => ID }) userId: string,
    @Args('limit', { type: () => Int, nullable: true }) limit?: number,
    @Args('skip', { type: () => Int, nullable: true }) skip?: number,
  ): Promise<UserFollowingDto[]> {
    const authHeader = context.req.headers.authorization;
    const authToken = authHeader ? authHeader.split(' ')[1] : undefined;
    return await this.userFollowingsService.findFollowerUsers(
      userId,
      limit,
      skip,
      authToken,
    );
  }

  @UseGuards(JwtGuard)
  @Query(() => [UserFollowingDto], { name: 'followingUsers' })
  async findFollowingUsers(
    @Context() context: GqlContext,
    @Args('userId', { type: () => ID }) userId: string,
    @Args('limit', { type: () => Int, nullable: true }) limit?: number,
    @Args('skip', { type: () => Int, nullable: true }) skip?: number,
  ): Promise<UserFollowingDto[]> {
    const authHeader = context.req.headers.authorization;
    const authToken = authHeader ? authHeader.split(' ')[1] : undefined;
    return await this.userFollowingsService.findFollowingUsers(
      userId,
      limit,
      skip,
      authToken,
    );
  }

  @UseGuards(JwtGuard)
  @Query(() => [UserFollowingDto], { name: 'followRequests' })
  async findFollowRequests(
    @Context() context: GqlContext,
    @Args('limit', { type: () => Int, nullable: true }) limit?: number,
    @Args('skip', { type: () => Int, nullable: true }) skip?: number,
  ): Promise<UserFollowingDto[]> {
    const userId = context.req.user.id;
    const authHeader = context.req.headers.authorization;
    const authToken = authHeader ? authHeader.split(' ')[1] : undefined;
    return await this.userFollowingsService.findFollowRequests(
      userId,
      limit,
      skip,
      authToken,
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
