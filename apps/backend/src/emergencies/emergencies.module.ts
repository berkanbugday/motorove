import { Module } from '@nestjs/common';
import { EmergenciesService } from './emergencies.service';
import { EmergenciesResolver } from './emergencies.resolver';
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
  providers: [EmergenciesResolver, EmergenciesService],
  exports: [EmergenciesService],
})
export class EmergenciesModule {}
