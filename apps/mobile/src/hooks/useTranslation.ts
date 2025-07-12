import {useTranslation as useI18nTranslation} from 'react-i18next';
import {useLanguage} from '@contexts';

/**
 * Custom hook for using translations in components
 *
 * Example usage:
 * ```
 * import { useTranslation } from '@hooks/useTranslation';
 *
 * const { t, language, setLanguage } = useTranslation();
 *
 * // Use translations
 * <Text>{t('common.hello')}</Text>
 *
 * // Change language
 * <Button onPress={() => setLanguage('tr')} />
 * ```
 */
export const useTranslation = () => {
  const {t, i18n} = useI18nTranslation();
  const {language, setLanguage} = useLanguage();

  return {
    t,
    i18n,
    language,
    setLanguage,
  };
};

export default useTranslation;
