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
} from './constants';
import { TomorrowIoResponse } from './interfaces/tomorrow-io-response.interface';
import { WeatherData } from './interfaces/weather-data.interface';

@Injectable()
export class WeatherService {
  private readonly logger = new Logger(WeatherService.name);
  private readonly apiKey: string;
  private readonly baseUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
    private readonly cacheService: CacheService,
  ) {
    this.apiKey = this.configService.get<string>('TOMORROW_IO_API_KEY', '');
    this.baseUrl = this.configService.get<string>(
      'WEATHER_API_BASE_URL',
      'https://api.tomorrow.io/v4/weather/realtime',
    );

    // Validate API key is available
    if (!this.apiKey) {
      this.logger.error('TOMORROW_IO_API_KEY is not configured');
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

      const user = await this.prisma.user.findUnique({
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
      const city = await this.prisma.city.findUnique({
        where: { id: cityId },
      });

      if (!city) {
        this.logger.warn(`City with ID ${cityId} not found`);
        return null;
      }

      // Fetch weather data from Tomorrow.io API
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
   * Fetch weather data from Tomorrow.io API
   * @param cityName The name of the city
   * @returns Weather data from the API
   */
  private async fetchWeatherFromApi(
    cityName: string,
  ): Promise<WeatherData | null> {
    try {
      // Validate API key
      if (!this.apiKey) {
        this.logger.error('Cannot fetch weather data: API key is missing');
        return null;
      }

      // Validate city name
      if (!cityName || typeof cityName !== 'string') {
        this.logger.error('Cannot fetch weather data: Invalid city name');
        return null;
      }

      const url = `${this.baseUrl}?location=${encodeURIComponent(cityName)}&apikey=${this.apiKey}&units=metric`;

      this.logger.debug(`Fetching weather data for ${cityName}`);

      const response = await firstValueFrom<TomorrowIoResponse>(
        this.httpService.get<TomorrowIoResponse>(url).pipe(
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

      if (!response.data || !response.data.values) {
        this.logger.warn(
          `Invalid response structure for ${cityName}: ${JSON.stringify(response)}`,
        );
        return null;
      }

      const { values } = response.data;

      if (
        typeof values.temperature !== 'number' ||
        typeof values.weatherCode !== 'number'
      ) {
        this.logger.warn(
          `Invalid temperature or weatherCode for ${cityName}: ${JSON.stringify(values)}`,
        );
        return null;
      }

      const { temperature, weatherCode } = values;

      return {
        temperature,
        condition: this.mapWeatherCodeToCondition(weatherCode),
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
   * Map Tomorrow.io weather code to our WeatherCondition enum
   * @param weatherCode The weather code from Tomorrow.io API
   * @returns The corresponding WeatherCondition
   */
  private mapWeatherCodeToCondition(weatherCode: number): WeatherCondition {
    // Tomorrow.io weather codes mapping based on their documentation
    switch (weatherCode) {
      case 1000: // Clear, Sunny
        return WeatherCondition.CLEAR;
      case 1100: // Mostly Clear
        return WeatherCondition.MOSTLY_CLEAR;
      case 1101: // Partly Cloudy
        return WeatherCondition.PARTLY_CLOUDY;
      case 1102: // Mostly Cloudy
        return WeatherCondition.MOSTLY_CLOUDY;
      case 1001: // Cloudy
        return WeatherCondition.CLOUDY;
      case 2000: // Fog
        return WeatherCondition.FOG;
      case 2100: // Light Fog
        return WeatherCondition.LIGHT_FOG;
      case 4000: // Drizzle
        return WeatherCondition.DRIZZLE;
      case 4001: // Rain
        return WeatherCondition.RAIN;
      case 4200: // Light Rain
        return WeatherCondition.LIGHT_RAIN;
      case 4201: // Heavy Rain
        return WeatherCondition.HEAVY_RAIN;
      case 5000: // Snow
        return WeatherCondition.SNOW;
      case 5001: // Flurries
        return WeatherCondition.FLURRIES;
      case 5100: // Light Snow
        return WeatherCondition.LIGHT_SNOW;
      case 5101: // Heavy Snow
        return WeatherCondition.HEAVY_SNOW;
      case 6000: // Freezing Drizzle
        return WeatherCondition.FREEZING_DRIZZLE;
      case 6001: // Freezing Rain
        return WeatherCondition.FREEZING_RAIN;
      case 6200: // Light Freezing Rain
        return WeatherCondition.LIGHT_FREEZING_RAIN;
      case 6201: // Heavy Freezing Rain
        return WeatherCondition.HEAVY_FREEZING_RAIN;
      case 7000: // Ice Pellets
        return WeatherCondition.ICE_PELLETS;
      case 7101: // Heavy Ice Pellets
        return WeatherCondition.HEAVY_ICE_PELLETS;
      case 7102: // Light Ice Pellets
        return WeatherCondition.LIGHT_ICE_PELLETS;
      case 8000: // Thunderstorm
        return WeatherCondition.THUNDERSTORM;
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
