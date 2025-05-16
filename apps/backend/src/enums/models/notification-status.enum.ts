import { registerEnumType } from '@nestjs/graphql';

export enum NotificationStatus {
  PENDING = 'PENDING',
  SENT = 'SENT',
  NOT_SENT = 'NOT_SENT',
  DELIVERED = 'DELIVERED',
  FAILED = 'FAILED',
}

registerEnumType(NotificationStatus, {
  name: 'NotificationStatus',
  description: 'The status of a notification',
});
