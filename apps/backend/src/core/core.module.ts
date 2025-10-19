import { Module, Global } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { ConfigModule } from './config/config.module';
import { CustomLogger } from './utils/logger.service';
import { SentryModule } from './sentry/sentry.module';
import { StorageModule } from './storage/storage.module';
import { ImageCensorFilterModule } from './image-censor-filter/image-censor-filter.module';
import { ProfanityFilterModule } from './profanity-filter/profanity-filter.module';
import { QueueModule } from './queue/queue.module';
import { WeatherModule } from './weather/weather.module';
import { ScheduleJobModule } from './schedule-job/schedule-job.module';
import { I18nModule } from './i18n/i18n.module';
@Global()
@Module({
  imports: [
    ScheduleModule.forRoot(),
    ConfigModule,
    SentryModule,
    StorageModule,
    ImageCensorFilterModule,
    ProfanityFilterModule,
    QueueModule,
    WeatherModule,
    ScheduleJobModule,
    I18nModule,
  ],
  providers: [CustomLogger],
  exports: [
    ConfigModule,
    CustomLogger,
    SentryModule,
    StorageModule,
    ImageCensorFilterModule,
    ProfanityFilterModule,
    QueueModule,
    WeatherModule,
    ScheduleJobModule,
  ],
})
export class CoreModule {}
