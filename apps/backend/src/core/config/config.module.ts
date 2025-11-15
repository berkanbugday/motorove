import { Module, Global } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import * as Joi from 'joi';
import { join } from 'path';
import { ConfigService } from './config.service';
import { NodeEnv, NodeEnvFileName } from './enums/node-env.enum';

@Global()
@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true,
      envFilePath: getEnvFilePath(),
      cache: true,
      validationSchema: Joi.object({
        NODE_ENV: Joi.string()
          .valid(NodeEnv.Dev, NodeEnv.Staging, NodeEnv.Prod)
          .default(NodeEnv.Dev),
        PORT: Joi.number().default(3000),
        DATABASE_URL: Joi.string().required(),
        SENTRY_DSN: Joi.string().optional().empty(''),
        API_PREFIX: Joi.string().default('api'),
        CORS_ORIGIN: Joi.string().default('*'),
        // Redis configuration
        REDIS_URL: Joi.string().default('redis://localhost:6379'),
        REDIS_HOST: Joi.string().default('localhost'),
        REDIS_PORT: Joi.number().default(6379),
        REDIS_PASSWORD: Joi.string().allow('').optional(),
        // Google Cloud Weather API configuration
        WEATHER_API_BASE_URL: Joi.string().default(
          'https://weather.googleapis.com/v1/currentConditions:lookup',
        ),
        GEOCODING_API_BASE_URL: Joi.string().default(
          'https://maps.googleapis.com/maps/api/geocode/json',
        ),
        WEATHER_API_KEY: Joi.string().required(),
        GEOCODING_API_KEY: Joi.string().required(),
        // Google Cloud Vision API configuration
        GOOGLE_CLOUD_VISION_API_KEY: Joi.string().required(),
      }),
      validationOptions: {
        allowUnknown: true,
        abortEarly: false,
      },
    }),
  ],
  providers: [ConfigService],
  exports: [ConfigService],
})
export class ConfigModule {}

/**
 * Returns the appropriate .env file path based on NODE_ENV
 */
function getEnvFilePath(): string[] {
  const environment = process.env.NODE_ENV || NodeEnv.Dev;
  const baseEnvFile = join(process.cwd(), '.env');
  const envFile = join(process.cwd(), `${NodeEnvFileName[environment]}`);

  // Always include base .env file as a fallback, then the environment-specific one
  return [baseEnvFile, envFile];
}
