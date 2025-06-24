/**
 * Weather-related type definitions
 */

export type WeatherCondition =
  | 'sunny'
  | 'cloudy'
  | 'partlyCloudy'
  | 'rainy'
  | 'stormy'
  | 'snowy'
  | 'foggy'
  | 'windy';

export interface WeatherData {
  /**
   * Current temperature in the specified unit
   */
  temperature: number;

  /**
   * Temperature unit (Celsius or Fahrenheit)
   */
  unit?: 'C' | 'F';

  /**
   * Current weather condition
   */
  condition: WeatherCondition;

  /**
   * Location name
   */
  location?: string;

  /**
   * Current humidity percentage
   */
  humidity?: number;

  /**
   * Wind speed (with unit if available)
   */
  windSpeed?: string;

  /**
   * Feels like temperature
   */
  feelsLike?: number;

  /**
   * Precipitation probability (0-100)
   */
  precipitation?: number;
}
