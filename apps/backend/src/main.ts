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

  // Get port from configuration
  const port = configService.getAppConfig().port;
  const environment = configService.getEnvironment();

  // Start the server
  await app.listen(port);

  // Log startup information
  logger.log(`Application is running in ${environment} mode`);
  logger.log(`Server running on: http://localhost:${port}`);

  if (!configService.isProduction()) {
    logger.log(`API available at: http://localhost:${port}/${apiPrefix}`);
    logger.log(`GraphQL Playground: http://localhost:${port}/graphql`);
  }
}

bootstrap().catch((err) => {
  console.error('Error during application bootstrap:', err);
  process.exit(1);
});
