import { registerEnumType } from '@nestjs/graphql';
import { WeatherCondition } from '@motorove/shared';

registerEnumType(WeatherCondition, {
  name: 'WeatherCondition',
  description: 'Weather conditions',
});

export { WeatherCondition };
