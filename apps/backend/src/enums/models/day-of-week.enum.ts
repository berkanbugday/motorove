import { registerEnumType } from '@nestjs/graphql';
import { DayOfWeek } from '@motorove/shared';

registerEnumType(DayOfWeek, {
  name: 'DayOfWeek',
  description: 'Days of the week for business hours and scheduling',
});

export { DayOfWeek };
