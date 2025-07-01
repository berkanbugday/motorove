import { registerEnumType } from '@nestjs/graphql';
import { EventParticipantStatus } from '@motorove/shared';

registerEnumType(EventParticipantStatus, {
  name: 'EventParticipantStatus',
  description: 'Status of a participant in an event',
});

export { EventParticipantStatus };
