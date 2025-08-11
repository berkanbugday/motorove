import { registerEnumType } from '@nestjs/graphql';

export enum ApprovalStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
}

registerEnumType(ApprovalStatus, { name: 'ApprovalStatus' });
