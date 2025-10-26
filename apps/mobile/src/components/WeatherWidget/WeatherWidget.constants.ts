import {colors} from '@theme';
import type {WeatherCondition} from './weather';
import {i18n} from '@/i18n';
/**
 * Weather condition background colors and text colors
 */
// export const weatherColors: Record<
//   WeatherCondition,
//   {background: string; text: string}
// > = {
//   sunny: {
//     background: colors.weather.sunny,
//     text: colors.neutral.black,
//   },
//   cloudy: {
//     background: colors.weather.cloudy,
//     text: colors.neutral.black,
//   },
//   partlyCloudy: {
//     background: colors.weather.partlyCloudy,
//     text: colors.neutral.black,
//   },
//   rainy: {
//     background: colors.weather.rainy,
//     text: colors.neutral.black,
//   },
//   stormy: {
//     background: colors.weather.stormy,
//     text: colors.neutral.white,
//   },
//   snowy: {
//     background: colors.weather.snowy,
//     text: colors.neutral.black,
//   },
//   foggy: {
//     background: colors.weather.foggy,
//     text: colors.neutral.black,
//   },
//   windy: {
//     background: colors.weather.windy,
//     text: colors.neutral.black,
//   },
// };

export const weatherColors: Record<
  WeatherCondition,
  {background: string; text: string}
> = {
  sunny: {
    background: colors.neutral.black,
    text: colors.neutral.white,
  },
  cloudy: {
    background: colors.neutral.black,
    text: colors.neutral.white,
  },
  partlyCloudy: {
    background: colors.neutral.black,
    text: colors.neutral.white,
  },
  rainy: {
    background: colors.neutral.black,
    text: colors.neutral.white,
  },
  stormy: {
    background: colors.neutral.black,
    text: colors.neutral.white,
  },
  snowy: {
    background: colors.neutral.black,
    text: colors.neutral.white,
  },
  foggy: {
    background: colors.neutral.black,
    text: colors.neutral.white,
  },
  windy: {
    background: colors.neutral.black,
    text: colors.neutral.white,
  },
};

/**
 * Get human-readable text for a weather condition
 */
export const getConditionText = (condition: WeatherCondition): string => {
  switch (condition) {
    case 'sunny':
      return i18n.t('components.weatherWidget.conditions.sunny');
    case 'cloudy':
      return i18n.t('components.weatherWidget.conditions.cloudy');
    case 'partlyCloudy':
      return i18n.t('components.weatherWidget.conditions.partlyCloudy');
    case 'rainy':
      return i18n.t('components.weatherWidget.conditions.rainy');
    case 'stormy':
      return i18n.t('components.weatherWidget.conditions.stormy');
    case 'snowy':
      return i18n.t('components.weatherWidget.conditions.snowy');
    case 'foggy':
      return i18n.t('components.weatherWidget.conditions.foggy');
    case 'windy':
      return i18n.t('components.weatherWidget.conditions.windy');
    default:
      return '';
  }
};
