import { Query, Resolver } from '@nestjs/graphql';
import { Weather } from './models/weather.model';
import { WeatherService } from './weather.service';
import { UseGuards } from '@nestjs/common';
import { JwtGuard } from '../../auth/guards/jwt.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { User } from '../../users/models/user.model';

@Resolver(() => Weather)
export class WeatherResolver {
  constructor(private readonly weatherService: WeatherService) {}

  @UseGuards(JwtGuard)
  @Query(() => Weather, { nullable: true })
  async weather(@CurrentUser() user: User): Promise<Weather | null> {
    return this.weatherService.getWeather(user.id);
  }
}
