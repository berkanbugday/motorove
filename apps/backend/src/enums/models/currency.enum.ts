import { registerEnumType } from '@nestjs/graphql';
import { Currency } from '@motorove/shared';

registerEnumType(Currency, {
  name: 'Currency',
  description: 'Currency types',
});

export { Currency };
