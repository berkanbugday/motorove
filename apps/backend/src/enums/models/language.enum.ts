import { registerEnumType } from '@nestjs/graphql';

export enum Language {
  EN = 'EN',
  TR = 'TR',
}

registerEnumType(Language, {
  name: 'Language',
  description: 'Supported languages in the application',
});
