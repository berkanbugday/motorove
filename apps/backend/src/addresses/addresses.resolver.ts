import { Resolver, Query, Mutation, Args, ID, Int } from '@nestjs/graphql';
import { AddressesService } from './addresses.service';
import { CreateAddressInput } from './dto/create-address.input';
import { UpdateAddressInput } from './dto/update-address.input';
import { UseGuards } from '@nestjs/common';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { FilterAddressInput } from './dto/filter-address.input';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { User } from 'src/users/models/user.model';
import { AddressDto } from './dto/address.dto';

@Resolver(() => AddressDto)
export class AddressesResolver {
  constructor(private readonly addressesService: AddressesService) {}

  @UseGuards(JwtGuard)
  @Query(() => [AddressDto], { name: 'addresses' })
  async findAll(
    @Args('limit', { type: () => Int, nullable: true }) limit?: number,
    @Args('skip', { type: () => Int, nullable: true }) skip?: number,
    @Args('filters', { type: () => FilterAddressInput, nullable: true })
    filters?: FilterAddressInput,
  ) {
    return await this.addressesService.findAll(limit, skip, filters);
  }

  @UseGuards(JwtGuard)
  @Query(() => AddressDto, { name: 'address' })
  async findOne(@Args('id', { type: () => ID }) id: string) {
    return await this.addressesService.findOne(id);
  }

  @UseGuards(JwtGuard)
  @Mutation(() => AddressDto)
  async create(
    @Args('input') input: CreateAddressInput,
    @CurrentUser() user: User,
  ) {
    return await this.addressesService.create(input, user.id);
  }

  @UseGuards(JwtGuard)
  @Mutation(() => AddressDto)
  async update(
    @Args('input') input: UpdateAddressInput,
    @CurrentUser() user: User,
  ) {
    return await this.addressesService.update(input, user.id);
  }

  @UseGuards(JwtGuard)
  @Mutation(() => Boolean)
  async remove(@Args('id') id: string) {
    return await this.addressesService.remove(id);
  }
}
