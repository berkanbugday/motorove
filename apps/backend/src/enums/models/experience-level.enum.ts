import { registerEnumType } from '@nestjs/graphql';

export enum ExperienceLevel {
  BEGINNER = 'BEGINNER',
  INTERMEDIATE = 'INTERMEDIATE',
  ADVANCED = 'ADVANCED',
  ALL_LEVELS = 'ALL_LEVELS',
}

registerEnumType(ExperienceLevel, {
  name: 'ExperienceLevel',
  description: 'Experience level for workshops and training events',
});
