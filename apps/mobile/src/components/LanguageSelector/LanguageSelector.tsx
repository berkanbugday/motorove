import React from 'react';
import {View, StyleSheet, TouchableOpacity} from 'react-native';
import {Icon} from '@components/Icon';
import {Body} from '@components';
import {colors, spacing} from '@theme';
import {useTranslation} from '@/hooks/useTranslation';
import {Language} from '@motorove/shared';

interface LanguageOption {
  code: string;
  name: string;
}

interface LanguageSelectorProps {
  onLanguageSelect?: (languageCode: string) => void;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  onLanguageSelect,
}) => {
  const {t, language, setLanguage} = useTranslation();

  const languageOptions: LanguageOption[] = [
    {
      code: Language.EN.toLowerCase(),
      name: t('common.english'),
    },
    {
      code: Language.TR.toLowerCase(),
      name: t('common.turkish'),
    },
  ];

  const handleLanguageSelect = async (languageCode: string) => {
    try {
      setLanguage(languageCode);
      onLanguageSelect?.(languageCode);
    } catch (error) {
      console.error('Error setting language:', error);
    }
  };

  const renderLanguageOption = (option: LanguageOption) => {
    const isSelected = language === option.code;

    return (
      <TouchableOpacity
        key={option.code}
        style={styles.languageOption}
        onPress={() => handleLanguageSelect(option.code)}>
        <View style={styles.languageInfo}>
          <Body weight="semiBold">{option.name}</Body>
        </View>
        {isSelected && (
          <Icon name="check-filled" size={20} color={colors.primary.main} />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {languageOptions.map(renderLanguageOption)}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  languageOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.secondary.main,
  },
  languageInfo: {
    flex: 1,
  },
});
