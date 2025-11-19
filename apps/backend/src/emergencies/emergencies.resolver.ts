import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { EmergenciesService } from './emergencies.service';
import { EmergencyDto } from './dto/emergency.dto';
import { CreateEmergencyInput } from './dto/create-emergency.input';
import { FilterEmergencyInput } from './dto/filter-emergency.input';
import { User } from '../users/models/user.model';

@Resolver(() => EmergencyDto)
export class EmergenciesResolver {
  constructor(private emergenciesService: EmergenciesService) {}

  @UseGuards(JwtGuard)
  @Query(() => [EmergencyDto], { name: 'emergencies' })
  async findAll(
    @Args('filter') filter: FilterEmergencyInput,
  ): Promise<EmergencyDto[]> {
    return await this.emergenciesService.findAll(filter);
  }

  @UseGuards(JwtGuard)
  @Query(() => EmergencyDto, { name: 'emergency' })
  async findOne(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<EmergencyDto> {
    return await this.emergenciesService.findOne(id);
  }

  @UseGuards(JwtGuard)
  @Query(() => [EmergencyDto], { name: 'myEmergencies' })
  async findMyEmergencies(@CurrentUser() user: User): Promise<EmergencyDto[]> {
    return await this.emergenciesService.findMyEmergencies(user.id);
  }

  @UseGuards(JwtGuard)
  @Mutation(() => EmergencyDto)
  async createEmergency(
    @Args('input') input: CreateEmergencyInput,
    @CurrentUser() user: User,
  ): Promise<EmergencyDto> {
    return await this.emergenciesService.create(input, user.id);
  }

  @UseGuards(JwtGuard)
  @Mutation(() => Boolean)
  async removeEmergency(
    @Args('id') id: string,
    @CurrentUser() user: User,
  ): Promise<boolean> {
    return await this.emergenciesService.remove(id, user.id);
  }
}
