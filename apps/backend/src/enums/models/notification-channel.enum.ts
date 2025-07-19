import { registerEnumType } from '@nestjs/graphql';
import { NotificationChannel } from '@motorove/shared';

registerEnumType(NotificationChannel, {
  name: 'NotificationChannel',
  description: 'Channel for notifications',
});

export { NotificationChannel };
