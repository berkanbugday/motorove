import { Module, Global } from '@nestjs/common';
import { ConfigModule } from './config/config.module';
import { CustomLogger } from './utils/logger.service';
import { SentryModule } from './sentry/sentry.module';
import { StorageModule } from './storage/storage.module';
import { ImageCensorFilterModule } from './image-censor-filter/image-censor-filter.module';
import { ProfanityFilterModule } from './profanity-filter/profanity-filter.module';
import { QueueModule } from './queue/queue.module';
@Global()
@Module({
  imports: [
    ConfigModule,
    SentryModule,
    StorageModule,
    ImageCensorFilterModule,
    ProfanityFilterModule,
    QueueModule,
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
  ],
})
export class CoreModule {}
