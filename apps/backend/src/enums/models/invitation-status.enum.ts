import { registerEnumType } from '@nestjs/graphql';

export enum InvitationStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
}

registerEnumType(InvitationStatus, { name: 'InvitationStatus' });
