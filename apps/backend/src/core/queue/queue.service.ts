import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bullmq';
import { NOTIFICATION_QUEUE, NotificationJobType } from './constants';
import { CreateNotificationInput } from '../../notifications/dto/create-notification.input';
import { CreateNotificationsInput } from '../../notifications/dto/create-notifications.input';

@Injectable()
export class QueueService {
  private readonly logger = new Logger(QueueService.name);

  constructor(
    @InjectQueue(NOTIFICATION_QUEUE) private readonly notificationQueue: Queue,
  ) {}

  /**
   * Add a single notification job to the queue
   * @param input Notification data
   * @param userId User ID who created the notification
   * @returns Job ID
   */
  async addNotificationJob(
    input: CreateNotificationInput,
    userId: string,
  ): Promise<string> {
    try {
      const job = await this.notificationQueue.add(
        NotificationJobType.SEND_NOTIFICATION,
        {
          input,
          userId,
        },
        {
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 1000,
          },
        },
      );
      this.logger.log(`Added notification job ${job.id} to queue`);
      return job.id as string;
    } catch (error) {
      this.logger.error('Failed to add notification job to queue', error);
      throw error;
    }
  }

  /**
   * Add a bulk notification job to the queue
   * @param input Bulk notification data
   * @param userId User ID who created the notifications
   * @returns Job ID
   */
  async addBulkNotificationJob(
    input: CreateNotificationsInput,
    userId: string,
  ): Promise<string> {
    try {
      const job = await this.notificationQueue.add(
        NotificationJobType.SEND_BULK_NOTIFICATION,
        {
          input,
          userId,
        },
        {
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 1000,
          },
        },
      );
      this.logger.log(`Added bulk notification job ${job.id} to queue`);
      return job.id as string;
    } catch (error) {
      this.logger.error('Failed to add bulk notification job to queue', error);
      throw error;
    }
  }
}
