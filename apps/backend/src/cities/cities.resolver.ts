import { Resolver, Query, Args, ID } from '@nestjs/graphql';
import { CitiesService } from './cities.service';
import { CityDto } from './dto/city.dto';
import { UseGuards } from '@nestjs/common';
import { JwtGuard } from '../auth/guards/jwt.guard';

@Resolver(() => CityDto)
export class CitiesResolver {
  constructor(private readonly citiesService: CitiesService) {}

  @UseGuards(JwtGuard)
  @Query(() => [CityDto], { name: 'cities' })
  findAll(): Promise<CityDto[]> {
    return this.citiesService.findAll();
  }

  @UseGuards(JwtGuard)
  @Query(() => CityDto, { name: 'city' })
  findOne(@Args('id', { type: () => ID }) id: string): Promise<CityDto> {
    return this.citiesService.findOne(id);
  }
}
