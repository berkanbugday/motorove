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
import { EventStatusJobModule } from './event-status-job/event-status-job.module';
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
    EventStatusJobModule,
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
    EventStatusJobModule,
  ],
})
export class CoreModule {}
