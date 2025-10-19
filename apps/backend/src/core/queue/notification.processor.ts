import { Process, Processor } from '@nestjs/bull';
import { Injectable, Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { NOTIFICATION_QUEUE, NotificationJobType } from './constants';
import { NotificationsService } from '../../notifications/notifications.service';
import { CreateNotificationInput } from '../../notifications/dto/create-notification.input';
import { CreateNotificationsInput } from '../../notifications/dto/create-notifications.input';

@Injectable()
@Processor(NOTIFICATION_QUEUE)
export class NotificationProcessor {
  private readonly logger = new Logger(NotificationProcessor.name);

  constructor(private readonly notificationsService: NotificationsService) {}

  @Process(NotificationJobType.SEND_NOTIFICATION)
  async handleSendNotification(
    job: Job<{ input: CreateNotificationInput; userId: string }>,
  ) {
    try {
      this.logger.log(
        `Processing notification job ${job.id} - attempt ${job.attemptsMade + 1}`,
      );
      const { input, userId } = job.data;
      await this.notificationsService.create(input, userId);
      this.logger.log(`Successfully processed notification job ${job.id}`);
    } catch (error) {
      this.logger.error(
        `Failed to process notification job ${job.id}`,
        error instanceof Error ? error.stack : String(error),
      );
      throw error;
    }
  }

  @Process(NotificationJobType.SEND_BULK_NOTIFICATION)
  async handleSendBulkNotification(
    job: Job<{ input: CreateNotificationsInput; userId: string }>,
  ) {
    try {
      this.logger.log(
        `Processing bulk notification job ${job.id} - attempt ${job.attemptsMade + 1}`,
      );
      const { input, userId } = job.data;
      await this.notificationsService.createBulk(input, userId);
      this.logger.log(`Successfully processed bulk notification job ${job.id}`);
    } catch (error) {
      this.logger.error(
        `Failed to process bulk notification job ${job.id}`,
        error instanceof Error ? error.stack : String(error),
      );
      throw error;
    }
  }
}
