import {colors} from '@theme';
import type {WeatherCondition} from './weather';
/**
 * Weather condition background colors and text colors
 */
export const weatherColors: Record<
  WeatherCondition,
  {background: string; text: string}
> = {
  sunny: {
    background: colors.weather.sunny,
    text: colors.neutral.black,
  },
  cloudy: {
    background: colors.weather.cloudy,
    text: colors.neutral.black,
  },
  partlyCloudy: {
    background: colors.weather.partlyCloudy,
    text: colors.neutral.black,
  },
  rainy: {
    background: colors.weather.rainy,
    text: colors.neutral.black,
  },
  stormy: {
    background: colors.weather.stormy,
    text: colors.neutral.white,
  },
  snowy: {
    background: colors.weather.snowy,
    text: colors.neutral.black,
  },
  foggy: {
    background: colors.weather.foggy,
    text: colors.neutral.black,
  },
  windy: {
    background: colors.weather.windy,
    text: colors.neutral.black,
  },
};

/**
 * Get human-readable text for a weather condition
 */
export const getConditionText = (condition: WeatherCondition): string => {
  switch (condition) {
    case 'sunny':
      return 'Sunny';
    case 'cloudy':
      return 'Cloudy';
    case 'partlyCloudy':
      return 'Partly Cloudy';
    case 'rainy':
      return 'Rainy';
    case 'stormy':
      return 'Thunderstorms';
    case 'snowy':
      return 'Snowy';
    case 'foggy':
      return 'Foggy';
    case 'windy':
      return 'Windy';
    default:
      return '';
  }
};
