import { registerEnumType } from '@nestjs/graphql';
import { Interest } from '@motorove/shared';

registerEnumType(Interest, {
  name: 'Interest',
  description: 'Different interests for motorcyclists',
});

export { Interest };
