import { Module, Global } from '@nestjs/common';
import { CustomLogger } from './logger.service';
import { SentryModule } from '../sentry/sentry.module';

@Global()
@Module({
  imports: [SentryModule],
  providers: [
    CustomLogger,
    {
      provide: 'LOGGER_SERVICE',
      useExisting: CustomLogger,
    },
  ],
  exports: [CustomLogger, 'LOGGER_SERVICE'],
})
export class LoggerModule {}
