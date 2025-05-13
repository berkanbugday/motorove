import { registerEnumType } from '@nestjs/graphql';

export enum GroupMembershipStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

registerEnumType(GroupMembershipStatus, { name: 'GroupMembershipStatus' });
