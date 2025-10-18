import { Language } from '../../../enums/models/language.enum';
import { enTranslations } from './en';
import { trTranslations } from './tr';

export const translations: Record<string, any> = {
  [Language.EN.toLowerCase()]: enTranslations,
  [Language.TR.toLowerCase()]: trTranslations,
};

export { enTranslations, trTranslations };
