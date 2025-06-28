import { registerEnumType } from '@nestjs/graphql';
import { Language } from '@motorove/shared';

registerEnumType(Language, {
  name: 'Language',
  description: 'Supported languages in the application',
});

export { Language };
