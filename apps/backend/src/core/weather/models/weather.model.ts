import { Field, Float, ObjectType } from '@nestjs/graphql';
import { WeatherCondition } from '../../../enums/models/weather-condition.enum';

@ObjectType()
export class Weather {
  @Field(() => Float)
  temperature: number;

  @Field(() => WeatherCondition)
  condition: WeatherCondition;

  @Field()
  cityId: string;

  @Field()
  cityName: string;
}
