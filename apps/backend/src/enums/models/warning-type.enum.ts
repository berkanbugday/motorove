import { registerEnumType } from '@nestjs/graphql';
import { WarningType } from '@motorove/shared';

registerEnumType(WarningType, {
  name: 'WarningType',
  description: 'Type of warning for motorcycle rides',
});

export { WarningType };
