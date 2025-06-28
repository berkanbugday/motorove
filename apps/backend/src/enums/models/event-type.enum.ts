import { registerEnumType } from '@nestjs/graphql';
import { EventType } from '@motorove/shared';

registerEnumType(EventType, {
  name: 'EventType',
  description: 'The types of events that can be created',
});
