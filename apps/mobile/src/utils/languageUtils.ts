import * as RNLocalize from 'react-native-localize';
import {Language} from '@motorove/shared';

const DEFAULT_LANGUAGE = Language.TR.toLowerCase();
/**
 * Gets the device language and checks if it's supported
 * @param defaultLanguage The default language to return if device language is not supported
 * @returns The detected device language or the default language
 */
export const getDeviceLanguage = (
  defaultLanguage: string = DEFAULT_LANGUAGE,
): string => {
  // Get user's preferred languages
  const locales = RNLocalize.getLocales();

  if (locales.length === 0) {
    return defaultLanguage;
  }

  // Get the language code from the first locale
  const languageCode = locales[0].languageCode.toLowerCase();

  // Check if the language is supported, otherwise return default
  return Object.values(Language)
    .map(lang => lang.toLowerCase())
    .includes(languageCode)
    ? languageCode
    : defaultLanguage;
};
