import { registerEnumType } from '@nestjs/graphql';

export enum DifficultyLevel {
  EASY = 'EASY',
  MEDIUM = 'MEDIUM',
  HARD = 'HARD',
}

registerEnumType(DifficultyLevel, {
  name: 'DifficultyLevel',
  description: 'Difficulty level for motorcycle rides',
});
