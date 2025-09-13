import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { WeatherCondition } from '../../enums/models/weather-condition.enum';
import { firstValueFrom } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { AxiosError } from 'axios';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import {
  WEATHER_CACHE_KEY_PREFIX,
  WEATHER_CACHE_EXPIRATION,
  WEATHER_CACHE_QUEUE,
} from './constants';
import { TomorrowIoResponse } from './interfaces/tomorrow-io-response.interface';
import { WeatherData } from './interfaces/weather-data.interface';

// Redis will handle the cache structure

@Injectable()
export class WeatherService {
  private readonly logger = new Logger(WeatherService.name);
  private readonly apiKey: string;
  private readonly baseUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
    @InjectQueue(WEATHER_CACHE_QUEUE) private readonly cacheQueue: Queue,
  ) {
    this.apiKey = this.configService.get<string>('TOMORROW_IO_API_KEY', '');
    this.baseUrl = this.configService.get<string>(
      'WEATHER_API_BASE_URL',
      'https://api.tomorrow.io/v4/weather/realtime',
    );
  }

  /**
   * Get weather data for a specific city
   * @param cityId The ID of the city
   * @returns Weather data for the city
   */
  async getWeather(userId: string): Promise<WeatherData | null> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId, isActive: true },
    });

    try {
      if (!user || !user.cityId) {
        this.logger.warn(`User with ID ${userId} not found`);
        return null;
      }

      const cityId = user.cityId;

      // Check Redis cache first
      const cacheKey = `${WEATHER_CACHE_KEY_PREFIX}${cityId}`;
      const cachedData = await this.cacheQueue.getJob(cacheKey);

      if (cachedData) {
        const jobData = (await cachedData.finished()) as
          | WeatherData
          | undefined;
        if (jobData) {
          this.logger.debug(`Using cached weather data for city ID: ${cityId}`);
          return jobData;
        }
      }

      // Cache miss or expired, fetch from API
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

        // Store in Redis cache with expiration
        await this.cacheQueue.add(cacheKey, completeWeatherData, {
          jobId: cacheKey,
          removeOnComplete: WEATHER_CACHE_EXPIRATION,
          removeOnFail: true,
        });

        return completeWeatherData;
      }

      return null;
    } catch (error) {
      this.logger.error(
        `Failed to get weather for city ID: ${user?.cityId}`,
        error,
      );
      return null;
    }
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
      const url = `${this.baseUrl}?location=${encodeURIComponent(cityName)}&apikey=${this.apiKey}&units=metric`;

      const response = await firstValueFrom<TomorrowIoResponse>(
        this.httpService.get<TomorrowIoResponse>(url).pipe(
          map((res) => res.data),
          catchError((error: AxiosError) => {
            this.logger.error(
              `Error fetching weather data for ${cityName}:`,
              error.response?.data || error.message,
            );
            throw error;
          }),
        ),
      );

      if (!response || !response.data) {
        this.logger.warn(`No weather data returned for ${cityName}`);
        return null;
      }

      const { temperature, weatherCode } = response.data.values;

      return {
        temperature,
        condition: this.mapWeatherCodeToCondition(weatherCode),
        cityId: '', // Will be filled by the calling method
        cityName,
        updatedAt: new Date(),
      };
    } catch (error) {
      this.logger.error(`Failed to fetch weather data for ${cityName}`, error);
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
        await this.cacheQueue.removeJobs(cacheKey);
        this.logger.debug(`Cleared weather cache for city ID: ${cityId}`);
      } else {
        // Clear all weather cache
        const jobs = await this.cacheQueue.getJobs([
          'active',
          'waiting',
          'delayed',
          'completed',
        ]);
        for (const job of jobs) {
          const jobId = job.id.toString();
          if (jobId.startsWith(WEATHER_CACHE_KEY_PREFIX)) {
            await job.remove();
          }
        }
        this.logger.debug('Cleared all weather cache');
      }
    } catch (error) {
      this.logger.error('Failed to clear weather cache', error);
    }
  }
}
