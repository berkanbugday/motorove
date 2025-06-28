import { registerEnumType } from '@nestjs/graphql';
import { DifficultyLevel } from '@motorove/shared';

registerEnumType(DifficultyLevel, {
  name: 'DifficultyLevel',
  description: 'Difficulty level for motorcycle rides',
});
