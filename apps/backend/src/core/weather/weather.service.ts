import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { WeatherCondition } from '../../enums/models/weather-condition.enum';
import { firstValueFrom } from 'rxjs';
import { catchError, map, timeout } from 'rxjs/operators';
import { AxiosError } from 'axios';
import { CacheService } from '../cache/cache.service';
import {
  WEATHER_CACHE_KEY_PREFIX,
  WEATHER_CACHE_EXPIRATION,
  GEOCODING_CACHE_KEY_PREFIX,
  GEOCODING_CACHE_EXPIRATION,
} from './constants';
import {
  GoogleCloudWeatherResponse,
  GoogleCloudWeatherConditionType,
} from './interfaces/google-cloud-weather-response.interface';
import { WeatherData } from './interfaces/weather-data.interface';

@Injectable()
export class WeatherService {
  private readonly logger = new Logger(WeatherService.name);
  private readonly weatherApiKey: string;
  private readonly geocodingApiKey: string;
  private readonly baseUrl: string;
  private readonly geocodingBaseUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
    private readonly cacheService: CacheService,
  ) {
    this.weatherApiKey = this.configService.get<string>('WEATHER_API_KEY', '');
    this.geocodingApiKey = this.configService.get<string>(
      'GEOCODING_API_KEY',
      '',
    );
    this.baseUrl = this.configService.get<string>('WEATHER_API_BASE_URL', '');
    this.geocodingBaseUrl = this.configService.get<string>(
      'GEOCODING_API_BASE_URL',
      '',
    );

    // Validate API keys are available
    if (!this.weatherApiKey) {
      this.logger.error('WEATHER_API_KEY is not configured');
    }
    if (!this.geocodingApiKey) {
      this.logger.error('GEOCODING_API_KEY is not configured');
    }
  }

  /**
   * Get weather data for a specific city
   * @param cityId The ID of the city
   * @returns Weather data for the city
   */
  async getWeather(userId: string): Promise<WeatherData | null> {
    try {
      // Validate input
      if (!userId) {
        this.logger.warn('getWeather called with invalid userId');
        return null;
      }

      const user = await this.prisma.user.findFirst({
        where: { id: userId, isActive: true },
      });

      if (!user || !user.cityId) {
        this.logger.warn(`User with ID ${userId} not found or has no cityId`);
        return null;
      }

      const cityId = user.cityId;
      const cacheKey = `${WEATHER_CACHE_KEY_PREFIX}${cityId}`;

      try {
        // Check Redis cache first
        const cachedData = await this.cacheService.get<WeatherData>(cacheKey);

        if (cachedData && this.isValidWeatherData(cachedData)) {
          this.logger.debug(`Using cached weather data for city ID: ${cityId}`);
          return cachedData;
        } else if (cachedData) {
          this.logger.debug(
            `Cached data for city ID: ${cityId} is invalid, fetching fresh data`,
          );
          // Invalid cache data, remove it
          await this.cacheService.del(cacheKey);
        }
      } catch (cacheError) {
        // If there's an error with the cache, log it and continue to fetch fresh data
        this.logger.warn(
          `Cache retrieval error for city ID: ${cityId}`,
          cacheError,
        );
        // Continue execution to fetch fresh data
      }

      // Cache miss, expired, or invalid - fetch from API
      const city = await this.prisma.city.findFirst({
        where: { id: cityId },
      });

      if (!city) {
        this.logger.warn(`City with ID ${cityId} not found`);
        return null;
      }

      // Fetch weather data from Google Cloud Weather API
      const weatherData = await this.fetchWeatherFromApi(city.value);

      if (weatherData) {
        // Prepare complete weather data with city info
        const completeWeatherData: WeatherData = {
          ...weatherData,
          cityId,
          cityName: city.value,
        };

        try {
          // Store in Redis cache with expiration
          await this.cacheService.set(
            cacheKey,
            completeWeatherData,
            WEATHER_CACHE_EXPIRATION,
          );

          this.logger.debug(
            `Cached weather data for city ID: ${cityId} with TTL: ${WEATHER_CACHE_EXPIRATION}s`,
          );
        } catch (cacheError) {
          // If caching fails, log it but still return the data
          this.logger.error(
            `Failed to cache weather data for city ID: ${cityId}`,
            cacheError,
          );
        }

        return completeWeatherData;
      }

      return null;
    } catch (error) {
      this.logger.error(
        `Failed to get weather for userId: ${userId}`,
        error instanceof Error ? error.message : String(error),
      );
      return null;
    }
  }

  /**
   * Validates that the weather data object has all required fields
   * @param data The weather data to validate
   * @returns True if the data is valid, false otherwise
   */
  private isValidWeatherData(data: unknown): data is WeatherData {
    if (!data || typeof data !== 'object') return false;

    const weatherData = data as Record<string, unknown>;
    return (
      typeof weatherData.temperature === 'number' &&
      typeof weatherData.condition === 'string' &&
      typeof weatherData.cityId === 'string' &&
      typeof weatherData.cityName === 'string'
    );
  }

  /**
   * Fetch weather data from Google Cloud Weather API
   * @param cityName The name of the city
   * @returns Weather data from the API
   */
  private async fetchWeatherFromApi(
    cityName: string,
  ): Promise<WeatherData | null> {
    try {
      // Validate API key
      if (!this.weatherApiKey) {
        this.logger.error(
          'Cannot fetch weather data: Weather API key is missing',
        );
        return null;
      }

      // Validate city name
      if (!cityName || typeof cityName !== 'string') {
        this.logger.error('Cannot fetch weather data: Invalid city name');
        return null;
      }

      // First, get coordinates for the city using Google Geocoding API
      const coordinates = await this.getCoordinatesForCity(cityName);
      if (!coordinates) {
        this.logger.error(`Could not get coordinates for city: ${cityName}`);
        return null;
      }

      const url = `${this.baseUrl}?key=${this.weatherApiKey}&location.latitude=${coordinates.lat}&location.longitude=${coordinates.lng}&unitsSystem=METRIC`;

      this.logger.debug(
        `Fetching weather data for ${cityName} at coordinates (${coordinates.lat}, ${coordinates.lng})`,
      );

      const response = await firstValueFrom<GoogleCloudWeatherResponse>(
        this.httpService.get<GoogleCloudWeatherResponse>(url).pipe(
          timeout(10000), // 10 second timeout
          map((res) => res.data),
          catchError((error: AxiosError) => {
            // More detailed error logging
            if (error.response) {
              this.logger.error(
                `API error for ${cityName}: Status ${error.response.status}`,
                error.response.data,
              );
            } else if (error.request) {
              this.logger.error(
                `Request error for ${cityName}: No response received`,
                error.message,
              );
            } else {
              this.logger.error(
                `Error setting up request for ${cityName}:`,
                error.message,
              );
            }
            throw error;
          }),
        ),
      );

      // Validate response structure
      if (!response) {
        this.logger.warn(`Empty response for ${cityName}`);
        return null;
      }

      if (!response.weatherCondition || !response.temperature) {
        this.logger.warn(
          `Invalid response structure for ${cityName}: ${JSON.stringify(response)}`,
        );
        return null;
      }

      const { weatherCondition, temperature } = response;
      if (typeof temperature.degrees !== 'number' || !weatherCondition.type) {
        this.logger.warn(
          `Invalid temperature or weather condition for ${cityName}: ${JSON.stringify({ temperature, weatherCondition })}`,
        );
        return null;
      }

      return {
        temperature: temperature.degrees,
        condition: this.mapGoogleCloudWeatherConditionToCondition(
          weatherCondition.type,
        ),
        cityId: '', // Will be filled by the calling method
        cityName,
      };
    } catch (error) {
      this.logger.error(
        `Failed to fetch weather data for ${cityName}`,
        error instanceof Error ? error.message : String(error),
      );
      return null;
    }
  }

  /**
   * Get coordinates for a city using Google Geocoding API
   * @param cityName The name of the city
   * @returns Coordinates (lat, lng) or null if not found
   */
  private async getCoordinatesForCity(
    cityName: string,
  ): Promise<{ lat: number; lng: number } | null> {
    try {
      const cacheKey = `${GEOCODING_CACHE_KEY_PREFIX}${cityName.toLowerCase()}`;

      // Check cache first
      const cachedCoordinates = await this.cacheService.get<{
        lat: number;
        lng: number;
      }>(cacheKey);

      if (cachedCoordinates) {
        this.logger.debug(`Using cached coordinates for ${cityName}`);
        return cachedCoordinates;
      }

      // If cache miss, fetch from Google Geocoding API
      const url = `${this.geocodingBaseUrl}?address=${encodeURIComponent(cityName)}&key=${this.geocodingApiKey}`;

      this.logger.debug(`Fetching coordinates for ${cityName}`);

      interface GeocodingResponse {
        results: Array<{
          geometry: {
            location: {
              lat: number;
              lng: number;
            };
          };
        }>;
      }

      const response = await firstValueFrom<GeocodingResponse>(
        this.httpService.get<GeocodingResponse>(url).pipe(
          timeout(10000),
          map((res) => res.data),
          catchError((error: AxiosError) => {
            this.logger.error(
              `Geocoding API error for ${cityName}:`,
              error.response?.data || error.message,
            );
            throw error;
          }),
        ),
      );

      if (!response || !response.results || response.results.length === 0) {
        this.logger.warn(`No geocoding results found for ${cityName}`);
        return null;
      }

      const location = response.results[0].geometry.location;
      const coordinates = { lat: location.lat, lng: location.lng };

      // Cache coordinates for 30 days (monthly)
      await this.cacheService.set(
        cacheKey,
        coordinates,
        GEOCODING_CACHE_EXPIRATION,
      );

      return coordinates;
    } catch (error) {
      this.logger.error(
        `Failed to get coordinates for ${cityName}`,
        error instanceof Error ? error.message : String(error),
      );
      return null;
    }
  }

  /**
   * Map Google Cloud Weather API condition type to our WeatherCondition enum
   * @param conditionType The condition type from Google Cloud Weather API
   * @returns The corresponding WeatherCondition
   */
  private mapGoogleCloudWeatherConditionToCondition(
    conditionType: GoogleCloudWeatherConditionType,
  ): WeatherCondition {
    // Google Cloud Weather API condition types mapping
    switch (conditionType) {
      case GoogleCloudWeatherConditionType.CLEAR:
        return WeatherCondition.CLEAR;
      case GoogleCloudWeatherConditionType.MOSTLY_CLEAR:
        return WeatherCondition.MOSTLY_CLEAR;
      case GoogleCloudWeatherConditionType.PARTLY_CLOUDY:
        return WeatherCondition.PARTLY_CLOUDY;
      case GoogleCloudWeatherConditionType.MOSTLY_CLOUDY:
        return WeatherCondition.MOSTLY_CLOUDY;
      case GoogleCloudWeatherConditionType.CLOUDY:
        return WeatherCondition.CLOUDY;
      case GoogleCloudWeatherConditionType.WINDY:
        return WeatherCondition.WIND;
      case GoogleCloudWeatherConditionType.WIND_AND_RAIN:
        return WeatherCondition.RAIN; // Map to general rain
      case GoogleCloudWeatherConditionType.LIGHT_RAIN_SHOWERS:
      case GoogleCloudWeatherConditionType.LIGHT_RAIN:
        return WeatherCondition.LIGHT_RAIN;
      case GoogleCloudWeatherConditionType.CHANCE_OF_SHOWERS:
      case GoogleCloudWeatherConditionType.SCATTERED_SHOWERS:
        return WeatherCondition.DRIZZLE;
      case GoogleCloudWeatherConditionType.RAIN_SHOWERS:
      case GoogleCloudWeatherConditionType.RAIN:
      case GoogleCloudWeatherConditionType.LIGHT_TO_MODERATE_RAIN:
        return WeatherCondition.RAIN;
      case GoogleCloudWeatherConditionType.HEAVY_RAIN_SHOWERS:
      case GoogleCloudWeatherConditionType.HEAVY_RAIN:
      case GoogleCloudWeatherConditionType.MODERATE_TO_HEAVY_RAIN:
      case GoogleCloudWeatherConditionType.RAIN_PERIODICALLY_HEAVY:
        return WeatherCondition.HEAVY_RAIN;
      case GoogleCloudWeatherConditionType.LIGHT_SNOW_SHOWERS:
      case GoogleCloudWeatherConditionType.LIGHT_SNOW:
      case GoogleCloudWeatherConditionType.LIGHT_TO_MODERATE_SNOW:
        return WeatherCondition.LIGHT_SNOW;
      case GoogleCloudWeatherConditionType.CHANCE_OF_SNOW_SHOWERS:
      case GoogleCloudWeatherConditionType.SCATTERED_SNOW_SHOWERS:
        return WeatherCondition.FLURRIES;
      case GoogleCloudWeatherConditionType.SNOW_SHOWERS:
      case GoogleCloudWeatherConditionType.SNOW:
      case GoogleCloudWeatherConditionType.MODERATE_TO_HEAVY_SNOW:
        return WeatherCondition.SNOW;
      case GoogleCloudWeatherConditionType.HEAVY_SNOW_SHOWERS:
      case GoogleCloudWeatherConditionType.HEAVY_SNOW:
      case GoogleCloudWeatherConditionType.SNOWSTORM:
      case GoogleCloudWeatherConditionType.SNOW_PERIODICALLY_HEAVY:
      case GoogleCloudWeatherConditionType.HEAVY_SNOW_STORM:
        return WeatherCondition.HEAVY_SNOW;
      case GoogleCloudWeatherConditionType.BLOWING_SNOW:
        return WeatherCondition.SNOW; // Map to general snow
      case GoogleCloudWeatherConditionType.RAIN_AND_SNOW:
        return WeatherCondition.RAIN; // Map to rain as primary
      case GoogleCloudWeatherConditionType.HAIL:
      case GoogleCloudWeatherConditionType.HAIL_SHOWERS:
        return WeatherCondition.ICE_PELLETS; // Map hail to ice pellets
      case GoogleCloudWeatherConditionType.THUNDERSTORM:
      case GoogleCloudWeatherConditionType.THUNDERSHOWER:
      case GoogleCloudWeatherConditionType.LIGHT_THUNDERSTORM_RAIN:
      case GoogleCloudWeatherConditionType.SCATTERED_THUNDERSTORMS:
      case GoogleCloudWeatherConditionType.HEAVY_THUNDERSTORM:
        return WeatherCondition.THUNDERSTORM;
      case GoogleCloudWeatherConditionType.TYPE_UNSPECIFIED:
      default:
        return WeatherCondition.UNKNOWN;
    }
  }

  /**
   * Clear the weather cache for a specific city or all cities
   * @param cityId Optional city ID to clear cache for
   */
  async clearCache(cityId?: string): Promise<void> {
    try {
      if (cityId) {
        // Clear cache for specific city
        const cacheKey = `${WEATHER_CACHE_KEY_PREFIX}${cityId}`;
        await this.cacheService.del(cacheKey);
        this.logger.debug(`Cleared weather cache for city ID: ${cityId}`);
      } else {
        // Clear all weather cache
        const pattern = `${WEATHER_CACHE_KEY_PREFIX}*`;
        const removedCount = await this.cacheService.delPattern(pattern);
        this.logger.debug(`Cleared ${removedCount} weather cache entries`);
      }
    } catch (error) {
      this.logger.error(
        'Failed to clear weather cache',
        error instanceof Error ? error.message : String(error),
      );
    }
  }
}
