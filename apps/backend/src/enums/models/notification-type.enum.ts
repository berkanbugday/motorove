import { registerEnumType } from '@nestjs/graphql';
import { NotificationType } from '@motorove/shared';

registerEnumType(NotificationType, {
  name: 'NotificationType',
  description: 'The type of notification',
});

export { NotificationType };
