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
        JWT_SECRET: Joi.string().required(),
        JWT_EXPIRATION: Joi.string().default('1d'),
        SENTRY_DSN: Joi.string().optional().empty(''),
        API_PREFIX: Joi.string().default('api'),
        SWAGGER_ENABLE: Joi.boolean().default(true),
        CORS_ORIGIN: Joi.string().default('*'),
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
