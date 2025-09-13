import { WeatherCondition } from '../../../enums/models/weather-condition.enum';

/**
 * Interface for weather data
 */
export interface WeatherData {
  temperature: number;
  condition: WeatherCondition;
  cityId: string;
  cityName: string;
  updatedAt: Date;
}
