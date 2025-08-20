import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { SupportsService } from './supports.service';
import { SupportRequest } from './models/support-request.model';
import { CreateSupportRequestInput } from './dto/create-support-request.input';
import { UseGuards } from '@nestjs/common';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/models/user.model';

@Resolver(() => SupportRequest)
export class SupportsResolver {
  constructor(private readonly supportsService: SupportsService) {}

  @Mutation(() => Boolean)
  @UseGuards(JwtGuard)
  async createSupportRequest(
    @Args('input') input: CreateSupportRequestInput,
    @CurrentUser() user: User,
  ): Promise<boolean> {
    return this.supportsService.createSupportRequest(input, user.id);
  }
}
