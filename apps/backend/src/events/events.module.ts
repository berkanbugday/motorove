import { Module } from '@nestjs/common';
import { EventsResolver } from './events.resolver';
import { EventsService } from './events.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { StorageModule } from '../core/storage/storage.module';
import { QueueModule } from '../core/queue/queue.module';
import { ProfanityFilterModule } from '../core/profanity-filter/profanity-filter.module';
import { ImageCensorFilterModule } from '../core/image-censor-filter/image-censor-filter.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    StorageModule,
    QueueModule,
    ProfanityFilterModule,
    ImageCensorFilterModule,
  ],
  providers: [EventsResolver, EventsService],
  exports: [EventsService],
})
export class EventsModule {}
