import { Resolver, Query, Args, Context, Int, Mutation } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { UsersService } from './users.service';
import { Request } from 'express';
import { UserDto } from './dto/user.dto';
import { AccountSetupInput } from './dto/account-setup.input';
import { UpdateNotificationPermissionInput } from './dto/update-notification-permission.input';

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
  @Query(() => UserDto)
  async userProfile(
    @Context() context: GqlContext,
    @Args('id') id: string,
  ): Promise<UserDto> {
    const userId = context.req.user.id;
    return await this.usersService.userProfile(id, userId);
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
  @Mutation(() => Boolean)
  async updateNotificationPermission(
    @Context() context: GqlContext,
    @Args('input') input: UpdateNotificationPermissionInput,
  ): Promise<boolean> {
    const userId = context.req.user.id;
    return await this.usersService.updateNotificationPermission(
      userId,
      input.notificationPermission,
    );
  }
}
