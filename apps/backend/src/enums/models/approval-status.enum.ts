import { registerEnumType } from '@nestjs/graphql';
import { ApprovalStatus } from '@motorove/shared';

registerEnumType(ApprovalStatus, {
  name: 'ApprovalStatus',
  description: 'Approval status for motorcycle-related businesses',
});

export { ApprovalStatus };
