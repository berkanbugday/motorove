/**
 * Interface for the Google Cloud Weather API response
 */
export interface GoogleCloudWeatherResponse {
  currentTime: string;
  timeZone: {
    id: string;
  };
  isDaytime: boolean;
  weatherCondition: {
    iconBaseUri: string;
    description: {
      text: string;
      languageCode: string;
    };
    type: GoogleCloudWeatherConditionType;
  };
  temperature: {
    degrees: number;
    unit: string;
  };
  feelsLikeTemperature?: {
    degrees: number;
    unit: string;
  };
  dewPoint?: {
    degrees: number;
    unit: string;
  };
  relativeHumidity?: number;
  uvIndex?: number;
  precipitation?: {
    probability: {
      percent: number;
      type: string;
    };
    qpf: {
      quantity: number;
      unit: string;
    };
  };
  thunderstormProbability?: number;
  airPressure?: {
    meanSeaLevelMillibars: number;
  };
  wind?: {
    direction: {
      degrees: number;
      cardinal: string;
    };
    speed: {
      value: number;
      unit: string;
    };
    gust?: {
      value: number;
      unit: string;
    };
  };
  visibility?: {
    distance: number;
    unit: string;
  };
  cloudCover?: number;
}

/**
 * Google Cloud Weather API condition types
 */
export enum GoogleCloudWeatherConditionType {
  TYPE_UNSPECIFIED = 'TYPE_UNSPECIFIED',
  CLEAR = 'CLEAR',
  MOSTLY_CLEAR = 'MOSTLY_CLEAR',
  PARTLY_CLOUDY = 'PARTLY_CLOUDY',
  MOSTLY_CLOUDY = 'MOSTLY_CLOUDY',
  CLOUDY = 'CLOUDY',
  WINDY = 'WINDY',
  WIND_AND_RAIN = 'WIND_AND_RAIN',
  LIGHT_RAIN_SHOWERS = 'LIGHT_RAIN_SHOWERS',
  CHANCE_OF_SHOWERS = 'CHANCE_OF_SHOWERS',
  SCATTERED_SHOWERS = 'SCATTERED_SHOWERS',
  RAIN_SHOWERS = 'RAIN_SHOWERS',
  HEAVY_RAIN_SHOWERS = 'HEAVY_RAIN_SHOWERS',
  LIGHT_TO_MODERATE_RAIN = 'LIGHT_TO_MODERATE_RAIN',
  MODERATE_TO_HEAVY_RAIN = 'MODERATE_TO_HEAVY_RAIN',
  RAIN = 'RAIN',
  LIGHT_RAIN = 'LIGHT_RAIN',
  HEAVY_RAIN = 'HEAVY_RAIN',
  RAIN_PERIODICALLY_HEAVY = 'RAIN_PERIODICALLY_HEAVY',
  LIGHT_SNOW_SHOWERS = 'LIGHT_SNOW_SHOWERS',
  CHANCE_OF_SNOW_SHOWERS = 'CHANCE_OF_SNOW_SHOWERS',
  SCATTERED_SNOW_SHOWERS = 'SCATTERED_SNOW_SHOWERS',
  SNOW_SHOWERS = 'SNOW_SHOWERS',
  HEAVY_SNOW_SHOWERS = 'HEAVY_SNOW_SHOWERS',
  LIGHT_TO_MODERATE_SNOW = 'LIGHT_TO_MODERATE_SNOW',
  MODERATE_TO_HEAVY_SNOW = 'MODERATE_TO_HEAVY_SNOW',
  SNOW = 'SNOW',
  LIGHT_SNOW = 'LIGHT_SNOW',
  HEAVY_SNOW = 'HEAVY_SNOW',
  SNOWSTORM = 'SNOWSTORM',
  SNOW_PERIODICALLY_HEAVY = 'SNOW_PERIODICALLY_HEAVY',
  HEAVY_SNOW_STORM = 'HEAVY_SNOW_STORM',
  BLOWING_SNOW = 'BLOWING_SNOW',
  RAIN_AND_SNOW = 'RAIN_AND_SNOW',
  HAIL = 'HAIL',
  HAIL_SHOWERS = 'HAIL_SHOWERS',
  THUNDERSTORM = 'THUNDERSTORM',
  THUNDERSHOWER = 'THUNDERSHOWER',
  LIGHT_THUNDERSTORM_RAIN = 'LIGHT_THUNDERSTORM_RAIN',
  SCATTERED_THUNDERSTORMS = 'SCATTERED_THUNDERSTORMS',
  HEAVY_THUNDERSTORM = 'HEAVY_THUNDERSTORM',
}
