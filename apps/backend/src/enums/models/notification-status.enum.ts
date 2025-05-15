import { registerEnumType } from '@nestjs/graphql';

export enum NotificationStatus {
  PENDING = 'PENDING',
  SENT = 'SENT',
  DELIVERED = 'DELIVERED',
  FAILED = 'FAILED',
}

registerEnumType(NotificationStatus, {
  name: 'NotificationStatus',
  description: 'The status of a notification',
});
