import { registerEnumType } from '@nestjs/graphql';
import { BusinessCategory } from '@motorove/shared';

registerEnumType(BusinessCategory, {
  name: 'BusinessCategory',
  description: 'Categories for motorcycle-related businesses',
});

export { BusinessCategory };
