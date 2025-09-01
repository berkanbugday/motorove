import { registerEnumType } from '@nestjs/graphql';
import { EventStatus } from '@motorove/shared';

registerEnumType(EventStatus, {
  name: 'EventStatus',
  description: 'The status of an event',
});

export { EventStatus };
