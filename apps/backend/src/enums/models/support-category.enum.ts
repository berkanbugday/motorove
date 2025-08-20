import { registerEnumType } from '@nestjs/graphql';
import { SupportCategory } from '@motorove/shared';

registerEnumType(SupportCategory, {
  name: 'SupportCategory',
  description: 'Different categories of support requests',
});

export { SupportCategory };
