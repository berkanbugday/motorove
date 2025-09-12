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
        connection: {
          host: configService.get('REDIS_HOST') || 'localhost',
          port: parseInt(configService.get('REDIS_PORT') || '6379', 10),
          password: configService.get('REDIS_PASSWORD'),
        },
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
