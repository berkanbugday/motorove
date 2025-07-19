import { registerEnumType } from '@nestjs/graphql';
import { NotificationPermission } from '@motorove/shared';

registerEnumType(NotificationPermission, {
  name: 'NotificationPermission',
  description: 'Permission for notifications',
});

export { NotificationPermission };
