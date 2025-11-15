import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { ConfigService } from '../config/config.service';
import { QueueService } from './queue.service';
import { NOTIFICATION_QUEUE } from './constants';
import { NotificationProcessor } from './notification.processor';
import { NotificationsModule } from '../../notifications/notifications.module';

@Module({
  imports: [
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        url: configService.get('REDIS_URL') || 'redis://localhost:6379',
        defaultJobOptions: {
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 1000,
          },
          removeOnComplete: true,
          removeOnFail: false,
        },
      }),
    }),
    BullModule.registerQueue({
      name: NOTIFICATION_QUEUE,
    }),
    NotificationsModule,
  ],
  providers: [QueueService, NotificationProcessor],
  exports: [BullModule, QueueService, NotificationProcessor],
})
export class QueueModule {}
