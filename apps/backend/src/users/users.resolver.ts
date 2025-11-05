import { Resolver, Query, Args, Context, Int, Mutation } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { UsersService } from './users.service';
import { Request } from 'express';
import { UserDto } from './dto/user.dto';
import { ProfileDto } from './dto/profile.dto';
import { AccountSetupInput } from './dto/account-setup.input';
import { UpdateUserProfileInput } from './dto/update-user-profile.input';
import { UserStatsDto } from './dto/user-stats.dto';

interface GqlContext {
  req: Request & {
    user: { id: string };
    headers: { authorization?: string };
  };
}

@Resolver(() => UserDto)
export class UsersResolver {
  constructor(private usersService: UsersService) {}

  @UseGuards(JwtGuard)
  @Query(() => [UserDto], { name: 'users' })
  async findAll(
    @Context() context: GqlContext,
    @Args('query', { type: () => String, nullable: true }) query?: string,
    @Args('limit', { type: () => Int, nullable: true }) limit?: number,
    @Args('skip', { type: () => Int, nullable: true }) skip?: number,
  ): Promise<UserDto[]> {
    const userId = context.req.user.id;
    const authHeader = context.req.headers.authorization;
    const authToken = authHeader ? authHeader.split(' ')[1] : undefined;
    return await this.usersService.findAll(
      query,
      limit,
      skip,
      userId,
      authToken,
    );
  }

  @UseGuards(JwtGuard)
  @Query(() => UserDto, { name: 'user' })
  async findOne(@Args('id') id: string): Promise<UserDto> {
    return await this.usersService.findOne(id);
  }

  @UseGuards(JwtGuard)
  @Query(() => ProfileDto)
  async userProfile(
    @Context() context: GqlContext,
    @Args('id', { type: () => String }) id: string,
  ): Promise<ProfileDto> {
    const currentUserId = context.req.user.id;
    const authHeader = context.req.headers.authorization;
    const authToken = authHeader ? authHeader.split(' ')[1] : undefined;
    return await this.usersService.userProfile(id, authToken, currentUserId);
  }

  @UseGuards(JwtGuard)
  @Query(() => UserStatsDto)
  async userStats(@Args('userId') userId: string): Promise<UserStatsDto> {
    return await this.usersService.getUserStats(userId);
  }

  @UseGuards(JwtGuard)
  @Mutation(() => Boolean)
  async accountSetup(
    @Context() context: GqlContext,
    @Args('input') input: AccountSetupInput,
  ): Promise<boolean> {
    const userId = context.req.user.id;
    const authHeader = context.req.headers.authorization;
    const authToken = authHeader ? authHeader.split(' ')[1] : undefined;
    return await this.usersService.accountSetup(input, userId, authToken);
  }

  @UseGuards(JwtGuard)
  @Mutation(() => ProfileDto)
  async updateUserProfile(
    @Context() context: GqlContext,
    @Args('input') input: UpdateUserProfileInput,
  ): Promise<ProfileDto> {
    const userId = context.req.user.id;
    const authHeader = context.req.headers.authorization;
    const authToken = authHeader ? authHeader.split(' ')[1] : undefined;
    return await this.usersService.updateUserProfile(input, userId, authToken);
  }
}
