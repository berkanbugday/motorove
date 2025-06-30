import { registerEnumType } from '@nestjs/graphql';
import { EventParticipantStatus } from '@motorove/shared';

registerEnumType(EventParticipantStatus, { name: 'EventParticipantStatus' });

export { EventParticipantStatus };
