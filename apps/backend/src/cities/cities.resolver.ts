import { Resolver, Query, Args, ID } from '@nestjs/graphql';
import { CitiesService } from './cities.service';
import { City } from './models/city.model';

@Resolver(() => City)
export class CitiesResolver {
  constructor(private readonly citiesService: CitiesService) {}

  @Query(() => [City], { name: 'cities' })
  findAll() {
    return this.citiesService.findAll();
  }

  @Query(() => City, { name: 'city', nullable: true })
  findOne(@Args('id', { type: () => ID }) id: string) {
    return this.citiesService.findOne(id);
  }
}
