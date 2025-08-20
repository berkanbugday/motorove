import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { SupportService } from './support.service';
import { SupportRequest } from './models/support-request.model';
import { CreateSupportRequestInput } from './dto/create-support-request.input';
import { UseGuards } from '@nestjs/common';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/models/user.model';

@Resolver(() => SupportRequest)
export class SupportResolver {
  constructor(private readonly supportService: SupportService) {}

  @Mutation(() => Boolean)
  @UseGuards(JwtGuard)
  async createSupportRequest(
    @Args('input') input: CreateSupportRequestInput,
    @CurrentUser() user: User,
  ): Promise<boolean> {
    return this.supportService.createSupportRequest(input, user.id);
  }
}
