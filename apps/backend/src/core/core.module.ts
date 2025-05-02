import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { SentryModule } from './sentry/sentry.module';
import { LoggerModule } from './utils/logger.module';
import { GraphqlExceptionFilter } from './filters/graphql-exception.filter';
import { ConfigModule } from './config/config.module';

@Module({
  imports: [ConfigModule, SentryModule, LoggerModule],
  providers: [
    {
      provide: APP_FILTER,
      useClass: GraphqlExceptionFilter,
    },
  ],
  exports: [ConfigModule, SentryModule, LoggerModule],
})
export class CoreModule {}
