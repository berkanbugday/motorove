import { Injectable } from '@nestjs/common';
import { ConfigService as NestConfigService } from '@nestjs/config';
import { NodeEnv } from './enums/node-env.enum';

/**
 * Extended ConfigService with typed methods and environment-specific helpers
 */
@Injectable()
export class ConfigService {
  constructor(private readonly configService: NestConfigService) {}

  /**
   * Get a configuration value with proper typing
   */
  get<T>(key: string, defaultValue?: T): T {
    return this.configService.get<T>(key) ?? (defaultValue as T);
  }

  /**
   * Get a nested configuration value with proper typing
   */
  getNestedConfig<T>(key: string, defaultValue?: T): T {
    return this.configService.get<T>(key) ?? (defaultValue as T);
  }

  /**
   * Check if the application is running in development mode
   */
  isDevelopment(): boolean {
    return this.getEnvironment() === NodeEnv.Dev;
  }

  /**
   * Check if the application is running in staging mode
   */
  isStaging(): boolean {
    return this.getEnvironment() === NodeEnv.Staging;
  }

  /**
   * Check if the application is running in production mode
   */
  isProduction(): boolean {
    return this.getEnvironment() === NodeEnv.Prod;
  }

  /**
   * Get the current environment
   */
  getEnvironment(): NodeEnv {
    return this.configService.get<NodeEnv>('environment') ?? NodeEnv.Dev;
  }

  /**
   * Get all authentication-related configurations
   */
  getAuthConfig(): { jwtSecret: string; jwtExpiration: string } {
    return (
      this.configService.get<{ jwtSecret: string; jwtExpiration: string }>(
        'auth',
      ) ?? {
        jwtSecret: '',
        jwtExpiration: '1d',
      }
    );
  }

  /**
   * Get all application-related configurations
   */
  getAppConfig(): {
    name: string;
    port: number;
    host: string;
    apiPrefix: string;
    corsOrigin: string;
    swaggerEnable: boolean;
  } {
    return (
      this.configService.get<{
        name: string;
        port: number;
        host: string;
        apiPrefix: string;
        corsOrigin: string;
        swaggerEnable: boolean;
      }>('app') ?? {
        name: 'Motorove API',
        port: 3000,
        host: '0.0.0.0',
        apiPrefix: 'api',
        corsOrigin: '*',
        swaggerEnable: false,
      }
    );
  }

  /**
   * Get logging configuration
   */
  getLoggingConfig(): { level: string; prettyPrint: boolean } {
    return (
      this.configService.get<{ level: string; prettyPrint: boolean }>(
        'logging',
      ) ?? {
        level: 'info',
        prettyPrint: false,
      }
    );
  }
}
