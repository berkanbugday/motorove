import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { CustomLogger } from './core/utils/logger.service';
import { ConfigService } from './core/config/config.service';

async function bootstrap() {
  // Create the app with our custom logger
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  // Get services from the app
  const logger = app.get(CustomLogger);
  const configService = app.get(ConfigService);

  // Set our custom logger as the app logger
  app.useLogger(logger);

  // Apply validation pipe globally
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  const appConfig = configService.getAppConfig();
  console.log('App Config:', appConfig);

  // Configure CORS based on environment
  const corsOrigin = configService.getAppConfig().corsOrigin;
  app.enableCors({
    origin: corsOrigin,
    credentials: true,
  });

  // Apply API prefix if configured
  const apiPrefix = configService.getAppConfig().apiPrefix;
  if (apiPrefix) {
    app.setGlobalPrefix(apiPrefix);
  }

  // Get port and host from configuration
  const port = configService.getAppConfig().port;
  const host = configService.getAppConfig().host;
  const environment = configService.getEnvironment();

  // Start the server
  await app.listen(port, host);
  const url = await app.getUrl();

  // Log startup information
  logger.log(`Application is running in ${environment} mode`);
  logger.log(`Server running on: ${url}`);

  if (!configService.isProduction()) {
    logger.log(`API available at: ${url}/${apiPrefix}`);
    logger.log(`GraphQL Playground: ${url}/graphql`);
  }
}

bootstrap().catch((err) => {
  console.error('Error during application bootstrap:', err);
  process.exit(1);
});
