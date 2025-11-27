import { registerEnumType } from '@nestjs/graphql';
import { ReportReason } from '@motorove/shared';

registerEnumType(ReportReason, {
  name: 'ReportReason',
  description: 'Reason for reporting content',
});

export { ReportReason };
