import { registerEnumType } from '@nestjs/graphql';
import { RidingStyle } from '@motorove/shared';

registerEnumType(RidingStyle, {
  name: 'RidingStyle',
  description: 'Different styles of motorcycle riding',
});

export { RidingStyle };
