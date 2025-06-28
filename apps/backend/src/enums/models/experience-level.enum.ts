import { registerEnumType } from '@nestjs/graphql';
import { ExperienceLevel } from '@motorove/shared';

registerEnumType(ExperienceLevel, {
  name: 'ExperienceLevel',
  description: 'Experience level for workshops and training events',
});

export { ExperienceLevel };
