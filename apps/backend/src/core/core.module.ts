import { Module, Global } from '@nestjs/common';
import { ConfigModule } from './config/config.module';
import { CustomLogger } from './utils/logger.service';
import { SentryModule } from './sentry/sentry.module';
import { StorageModule } from './storage/storage.module';

@Global()
@Module({
  imports: [ConfigModule, SentryModule, StorageModule],
  providers: [CustomLogger],
  exports: [ConfigModule, CustomLogger, SentryModule, StorageModule],
})
export class CoreModule {}
