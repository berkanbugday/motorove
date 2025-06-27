import { Resolver, Query, Mutation, Args, ID, Int } from '@nestjs/graphql';
import { AddressesService } from './addresses.service';
import { Address } from './models/address.model';
import { CreateAddressInput } from './dto/create-address.input';
import { UpdateAddressInput } from './dto/update-address.input';
import { UseGuards } from '@nestjs/common';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { AddressFilterInput } from './dto/address-filter.input';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { User } from 'src/users/models/user.model';

@Resolver(() => Address)
export class AddressesResolver {
  constructor(private readonly addressesService: AddressesService) {}

  @UseGuards(JwtGuard)
  @Query(() => [Address], { name: 'addresses' })
  async findAll(
    @Args('limit', { type: () => Int, nullable: true }) limit?: number,
    @Args('skip', { type: () => Int, nullable: true }) skip?: number,
    @Args('filters', { type: () => AddressFilterInput, nullable: true })
    filters?: AddressFilterInput,
  ) {
    return this.addressesService.findAll(limit, skip, filters);
  }

  @UseGuards(JwtGuard)
  @Query(() => Address, { name: 'address' })
  async findOne(@Args('id', { type: () => ID }) id: string) {
    return this.addressesService.findOne(id);
  }

  @UseGuards(JwtGuard)
  @Mutation(() => Address)
  async create(
    @Args('input') input: CreateAddressInput,
    @CurrentUser() user: User,
  ) {
    return this.addressesService.create(input, user.id);
  }

  @UseGuards(JwtGuard)
  @Mutation(() => Address)
  async update(
    @Args('input') input: UpdateAddressInput,
    @CurrentUser() user: User,
  ) {
    return this.addressesService.update(input, user.id);
  }

  @UseGuards(JwtGuard)
  @Mutation(() => Boolean)
  async remove(@Args('id') id: string) {
    return this.addressesService.remove(id);
  }
}
