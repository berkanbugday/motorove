import { registerEnumType } from '@nestjs/graphql';
import { ReportStatus } from '@motorove/shared';

registerEnumType(ReportStatus, {
  name: 'ReportStatus',
  description: 'Status of a content report',
});

export { ReportStatus };
