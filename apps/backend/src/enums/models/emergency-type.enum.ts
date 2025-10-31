import { registerEnumType } from '@nestjs/graphql';
import { EmergencyType } from '@motorove/shared';

registerEnumType(EmergencyType, {
  name: 'EmergencyType',
  description: 'Type of emergency for motorcycle rides',
});

export { EmergencyType };
