import { Resolver, Query } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { User } from './models/user.model';
import { JwtGuard } from './guards/jwt.guard';
import { CurrentUser } from './decorators/current-user.decorator';

@Resolver(() => User)
export class UserResolver {
  @Query(() => User)
  @UseGuards(JwtGuard)
  me(@CurrentUser() user: User): User {
    return user;
  }
}
