import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { WarningsService } from './warnings.service';
import { WarningDto } from './dto/warning.dto';
import { CreateWarningInput } from './dto/create-warning.input';
import { FilterWarningInput } from './dto/filter-warning.input';
import { User } from '../users/models/user.model';

@Resolver(() => WarningDto)
export class WarningsResolver {
  constructor(private warningsService: WarningsService) {}

  @UseGuards(JwtGuard)
  @Query(() => [WarningDto], { name: 'warnings' })
  async findAll(
    @Args('filter') filter: FilterWarningInput,
  ): Promise<WarningDto[]> {
    return await this.warningsService.findAll(filter);
  }

  @UseGuards(JwtGuard)
  @Query(() => WarningDto, { name: 'warning' })
  async findOne(@Args('id') id: string): Promise<WarningDto> {
    return await this.warningsService.findOne(id);
  }

  @UseGuards(JwtGuard)
  @Query(() => [WarningDto], { name: 'myWarnings' })
  async findMyWarnings(@CurrentUser() user: User): Promise<WarningDto[]> {
    return await this.warningsService.findMyWarnings(user.id);
  }

  @UseGuards(JwtGuard)
  @Mutation(() => WarningDto)
  async createWarning(
    @Args('input') input: CreateWarningInput,
    @CurrentUser() user: User,
  ): Promise<WarningDto> {
    return await this.warningsService.create(input, user.id);
  }

  @UseGuards(JwtGuard)
  @Mutation(() => Boolean)
  async removeWarning(
    @Args('id') id: string,
    @CurrentUser() user: User,
  ): Promise<boolean> {
    return await this.warningsService.remove(id, user.id);
  }
}
