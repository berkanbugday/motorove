import { registerEnumType } from '@nestjs/graphql';

export enum EventParticipantStatus {
  JOINED = 'JOINED',
  LEFT = 'LEFT',
}

registerEnumType(EventParticipantStatus, { name: 'EventParticipantStatus' });
