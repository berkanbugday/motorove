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
    return this.configService.get<NodeEnv>('NODE_ENV') ?? NodeEnv.Dev;
  }
}
