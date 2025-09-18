import {useQuery} from '@apollo/client';
import {GET_WEATHER} from './graphql/weather.graphql';
import {loggingService} from './logging.service';
import {showToast} from '@components';
import {useTranslation} from '@hooks/useTranslation';
import {WeatherCondition, WeatherData} from '@components/WeatherWidget/weather';
import {WeatherCondition as WeatherConditionEnum} from '@motorove/shared';

// Hook for getting weather data
export const useGetWeather = () => {
  const {t} = useTranslation();
  const {data, loading, error, refetch} = useQuery(GET_WEATHER, {
    fetchPolicy: 'network-only',
    nextFetchPolicy: 'cache-first',
    onError: errorObj => {
      loggingService.error('Error fetching weather data:', errorObj);
      showToast({
        type: 'error',
        text1: t('common.error'),
        text2: t('screens.home.error_fetching_weather'),
      });
    },
  });

  // Map backend weather condition to frontend WeatherCondition type
  const mapConditionToWeatherCondition = (
    condition: string,
  ): WeatherCondition => {
    // Map the backend enum values to the frontend WeatherCondition type
    switch (condition) {
      case WeatherConditionEnum.CLEAR:
      case WeatherConditionEnum.MOSTLY_CLEAR:
        return 'sunny';
      case WeatherConditionEnum.PARTLY_CLOUDY:
        return 'partlyCloudy';
      case WeatherConditionEnum.MOSTLY_CLOUDY:
      case WeatherConditionEnum.CLOUDY:
        return 'cloudy';
      case WeatherConditionEnum.FOG:
      case WeatherConditionEnum.LIGHT_FOG:
        return 'foggy';
      case WeatherConditionEnum.DRIZZLE:
      case WeatherConditionEnum.RAIN:
      case WeatherConditionEnum.LIGHT_RAIN:
      case WeatherConditionEnum.HEAVY_RAIN:
      case WeatherConditionEnum.FREEZING_DRIZZLE:
      case WeatherConditionEnum.FREEZING_RAIN:
      case WeatherConditionEnum.LIGHT_FREEZING_RAIN:
      case WeatherConditionEnum.HEAVY_FREEZING_RAIN:
        return 'rainy';
      case WeatherConditionEnum.SNOW:
      case WeatherConditionEnum.FLURRIES:
      case WeatherConditionEnum.LIGHT_SNOW:
      case WeatherConditionEnum.HEAVY_SNOW:
      case WeatherConditionEnum.ICE_PELLETS:
      case WeatherConditionEnum.HEAVY_ICE_PELLETS:
      case WeatherConditionEnum.LIGHT_ICE_PELLETS:
        return 'snowy';
      case WeatherConditionEnum.THUNDERSTORM:
        return 'stormy';
      default:
        return 'sunny'; // Default fallback
    }
  };

  // Transform the API response to match the WeatherWidget component's expected format
  const weatherData: WeatherData | null = data?.weather
    ? {
        temperature: data.weather.temperature,
        condition: mapConditionToWeatherCondition(data.weather.condition),
        location: data.weather.cityName,
        unit: 'C', // Assuming the API returns Celsius
      }
    : null;

  return {
    weatherData,
    loading,
    error,
    refetch,
  };
};

// Export as WeatherService object
export const WeatherService = {
  useGetWeather,
};

export default WeatherService;
