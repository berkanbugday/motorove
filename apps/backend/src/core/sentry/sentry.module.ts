import { Module, Global } from '@nestjs/common';
import { SentryService } from './sentry.service';
import { ConfigModule } from '../config/config.module';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [SentryService],
  exports: [SentryService],
})
export class SentryModule {}
