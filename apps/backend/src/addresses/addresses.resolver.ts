import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { AddressesService } from './addresses.service';
import { Address } from './models/address.model';
import { CreateAddressInput } from './dto/create-address.input';
import { UpdateAddressInput } from './dto/update-address.input';
import { UseGuards } from '@nestjs/common';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { Int } from '@nestjs/graphql';
import { AddressFilterInput } from './dto/address-filter.input';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { User } from 'src/users/models/user.model';

@Resolver(() => Address)
export class AddressesResolver {
  constructor(private readonly addressesService: AddressesService) {}

  @UseGuards(JwtGuard)
  @Mutation(() => Address)
  createAddress(
    @Args('createAddressInput') createAddressInput: CreateAddressInput,
    @CurrentUser() user: User,
  ) {
    const userId = user.id;
    return this.addressesService.createAddress(userId, createAddressInput);
  }

  @UseGuards(JwtGuard)
  @Mutation(() => Address)
  updateAddress(
    @Args('updateAddressInput') updateAddressInput: UpdateAddressInput,
    @CurrentUser() user: User,
  ) {
    const userId = user.id;
    return this.addressesService.updateAddress(userId, updateAddressInput);
  }

  @UseGuards(JwtGuard)
  @Query(() => [Address], { name: 'addresses' })
  findAll(
    @Args('limit', { type: () => Int, nullable: true }) limit?: number,
    @Args('skip', { type: () => Int, nullable: true }) skip?: number,
    @Args('filters', { type: () => AddressFilterInput, nullable: true })
    filters?: AddressFilterInput,
  ) {
    return this.addressesService.findAll(limit, skip, filters);
  }

  @UseGuards(JwtGuard)
  @Query(() => Address, { name: 'address' })
  findOne(@Args('id') id: string) {
    return this.addressesService.findOne(id);
  }

  @UseGuards(JwtGuard)
  @Mutation(() => Boolean)
  removeAddress(@Args('id') id: string, @CurrentUser() user: User) {
    return this.addressesService.removeAddress(user.id, id);
  }
}
