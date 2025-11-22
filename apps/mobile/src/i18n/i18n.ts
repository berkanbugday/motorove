import i18n from 'i18next';
import {initReactI18next} from 'react-i18next';
import resources from './locales';
import {getDeviceLanguage} from '../utils/languageUtils';
import {Language} from '@motorove/shared';

const DEFAULT_LANGUAGE = Language.EN.toLowerCase();
// Initialize i18n
i18n.use(initReactI18next).init({
  resources,
  lng: getDeviceLanguage(DEFAULT_LANGUAGE),
  fallbackLng: DEFAULT_LANGUAGE,
  compatibilityJSON: 'v4',
  interpolation: {
    escapeValue: false, // React already safes from xss
  },
  react: {
    useSuspense: false,
  },
});

export default i18n;
