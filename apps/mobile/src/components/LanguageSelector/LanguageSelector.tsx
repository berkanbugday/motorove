import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import {Language} from '@motorove/shared';
import {useTranslation} from '@/hooks/useTranslation';

interface LanguageSelectorProps {
  containerStyle?: ViewStyle;
  textStyle?: TextStyle;
  buttonStyle?: ViewStyle;
  selectedButtonStyle?: ViewStyle;
  selectedTextStyle?: TextStyle;
}

/**
 * LanguageSelector - A component to switch between supported languages
 */
const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  containerStyle,
  textStyle,
  buttonStyle,
  selectedButtonStyle,
  selectedTextStyle,
}) => {
  const {language, setLanguage, t} = useTranslation();

  // Language labels
  const languageLabels: Record<string, string> = {
    en: 'English',
    tr: 'Türkçe',
  };

  // Handle language change
  const handleLanguageChange = (lang: string) => {
    setLanguage(lang);
  };

  return (
    <View style={[styles.container, containerStyle]}>
      <Text style={[styles.title, textStyle]}>{t('settings.language')}</Text>
      <View style={styles.buttonContainer}>
        {Object.values(Language).map(lang => (
          <TouchableOpacity
            key={lang}
            style={[
              styles.languageButton,
              buttonStyle,
              language === lang.toLowerCase() && [
                styles.selectedButton,
                selectedButtonStyle,
              ],
            ]}
            onPress={() => handleLanguageChange(lang.toLowerCase())}>
            <Text
              style={[
                styles.buttonText,
                textStyle,
                language === lang.toLowerCase() && [
                  styles.selectedText,
                  selectedTextStyle,
                ],
              ]}>
              {languageLabels[lang.toLowerCase()]}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  buttonContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  languageButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    marginRight: 8,
  },
  selectedButton: {
    backgroundColor: '#007AFF',
  },
  buttonText: {
    fontSize: 14,
    color: '#333',
  },
  selectedText: {
    color: '#ffffff',
    fontWeight: '600',
  },
});

export default LanguageSelector;
