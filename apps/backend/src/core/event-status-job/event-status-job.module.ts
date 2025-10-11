import { Module } from '@nestjs/common';
import { EventStatusJobService } from './event-status-job.service';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [EventStatusJobService],
  exports: [EventStatusJobService],
})
export class EventStatusJobModule {}
