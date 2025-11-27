import { Resolver, Mutation, Query, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/models/user.model';
import { UserBlocksService } from './user-blocks.service';
import { UserBlockDto } from './dto/user-block.dto';

@Resolver()
export class UserBlocksResolver {
  constructor(private readonly userBlocksService: UserBlocksService) {}

  @UseGuards(JwtGuard)
  @Mutation(() => Boolean)
  async blockUser(
    @CurrentUser() user: User,
    @Args('blockedUserId', { type: () => ID }) blockedUserId: string,
  ): Promise<boolean> {
    return await this.userBlocksService.blockUser(blockedUserId, user.id);
  }

  @UseGuards(JwtGuard)
  @Mutation(() => Boolean)
  async unblockUser(
    @CurrentUser() user: User,
    @Args('blockedUserId', { type: () => ID }) blockedUserId: string,
  ): Promise<boolean> {
    return await this.userBlocksService.unblockUser(blockedUserId, user.id);
  }

  @UseGuards(JwtGuard)
  @Query(() => [UserBlockDto], { name: 'blockedUsers' })
  async getBlockedUsers(@CurrentUser() user: User): Promise<UserBlockDto[]> {
    return await this.userBlocksService.getBlockedUsers(user.id);
  }

  @UseGuards(JwtGuard)
  @Query(() => Boolean, { name: 'isUserBlocked' })
  async isUserBlocked(
    @CurrentUser() user: User,
    @Args('userId', { type: () => ID }) userId: string,
  ): Promise<boolean> {
    return await this.userBlocksService.isUserBlocked(user.id, userId);
  }
}
