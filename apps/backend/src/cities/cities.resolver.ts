import { Resolver, Query, Args, ID } from '@nestjs/graphql';
import { CitiesService } from './cities.service';
import { CityDto } from './dto/city.dto';

@Resolver(() => CityDto)
export class CitiesResolver {
  constructor(private readonly citiesService: CitiesService) {}

  @Query(() => [CityDto], { name: 'cities' })
  findAll(): Promise<CityDto[]> {
    return this.citiesService.findAll();
  }

  @Query(() => CityDto, { name: 'city' })
  findOne(@Args('id', { type: () => ID }) id: string): Promise<CityDto> {
    return this.citiesService.findOne(id);
  }
}
