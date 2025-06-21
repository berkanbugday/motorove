import { Resolver, Query, Args, Context } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { User } from '../auth/models/user.model';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { UsersService } from './users.service';
import { Request } from 'express';
import { SearchUsersInput } from './dto/search-users.input';
import { UserProfile } from './models/user-profile.model';

interface GqlContext {
  req: Request & {
    user: { id: string };
    headers: { authorization?: string };
  };
}

@Resolver(() => User)
export class UsersResolver {
  constructor(private usersService: UsersService) {}

  @Query(() => User, { nullable: true })
  @UseGuards(JwtGuard)
  async user(@Args('id') id: string): Promise<User | null> {
    return this.usersService.findOne(id);
  }

  @Query(() => UserProfile, { nullable: true })
  @UseGuards(JwtGuard)
  async userProfile(
    @Context() context: GqlContext,
    @Args('id') id: string,
  ): Promise<UserProfile | null> {
    const userId = context.req.user.id;
    return this.usersService.getUserProfile(id, userId);
  }

  @Query(() => [User])
  @UseGuards(JwtGuard)
  async searchUsers(
    @Context() context: GqlContext,
    @Args('input') input: SearchUsersInput,
  ): Promise<User[]> {
    const userId = context.req.user.id;
    return this.usersService.searchUsers(
      input.query,
      userId,
      input.limit,
      input.skip,
    );
  }

  @Query(() => [User])
  @UseGuards(JwtGuard)
  async getUsersByIds(
    @Args('ids', { type: () => [String] }) ids: string[],
  ): Promise<User[]> {
    return this.usersService.findByIds(ids);
  }
}
