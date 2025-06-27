import { Resolver, Query, Args, Context, Int } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { User } from './models/user.model';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { UsersService } from './users.service';
import { Request } from 'express';
import { UserDto } from './dto/user.dto';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';

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
    @CurrentUser() user: User,
    @Args('query', { type: () => String, nullable: true }) query?: string,
    @Args('limit', { type: () => Int, nullable: true }) limit?: number,
    @Args('skip', { type: () => Int, nullable: true }) skip?: number,
  ): Promise<UserDto[]> {
    return await this.usersService.findAll(query, limit, skip, user.id);
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
}
