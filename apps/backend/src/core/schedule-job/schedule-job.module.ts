import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { QueueModule } from '../queue/queue.module';
import { EventReminderJobService } from './event-reminder-job.service';
import { EventStatusJobService } from './event-status-job.service';

/**
 * Unified module for all scheduled job services
 * Manages event-related cron jobs with proper dependency injection
 */
@Module({
  imports: [PrismaModule, QueueModule],
  providers: [EventReminderJobService, EventStatusJobService],
  exports: [EventReminderJobService, EventStatusJobService],
})
export class ScheduleJobModule {}
