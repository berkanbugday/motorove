import { Module } from '@nestjs/common';
import { WarningsService } from './warnings.service';
import { WarningsResolver } from './warnings.resolver';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { ProfanityFilterModule } from '../core/profanity-filter/profanity-filter.module';
import { QueueModule } from '../core/queue/queue.module';
import { UserLocationsModule } from '../user-locations/user-locations.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    ProfanityFilterModule,
    QueueModule,
    UserLocationsModule,
  ],
  providers: [WarningsResolver, WarningsService],
  exports: [WarningsService],
})
export class WarningsModule {}
