import { registerEnumType } from '@nestjs/graphql';
import { NotificationStatus } from '@motorove/shared';

registerEnumType(NotificationStatus, {
  name: 'NotificationStatus',
  description: 'The status of a notification',
});

export { NotificationStatus };
