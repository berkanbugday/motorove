import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  ReactNode,
} from 'react';
import {useTranslation} from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Language} from '@motorove/shared';
import {getDeviceLanguage} from '../utils/languageUtils';

const LANGUAGE_KEY = 'user_language_preference';
const DEFAULT_LANGUAGE = Language.TR.toLowerCase();

type LanguageContextType = {
  language: string;
  setLanguage: (language: string) => void;
  isLoading: boolean;
};

const LanguageContext = createContext<LanguageContextType | null>(null);

// Language Provider component
export const LanguageProvider: React.FC<{children: ReactNode}> = ({
  children,
}) => {
  const [language, setLanguageState] = useState<string>(DEFAULT_LANGUAGE);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const {i18n} = useTranslation();

  // Function to set language
  const setLanguage = async (lang: string) => {
    setLanguageState(lang);
    await AsyncStorage.setItem(LANGUAGE_KEY, lang);
    i18n.changeLanguage(lang);
  };

  // Initialize language on component mount
  useEffect(() => {
    const initializeLanguage = async () => {
      try {
        // Check if a language preference is stored
        const storedLanguage = await AsyncStorage.getItem(LANGUAGE_KEY);

        if (storedLanguage) {
          // Use stored language preference
          setLanguageState(storedLanguage);
          i18n.changeLanguage(storedLanguage);
        } else {
          // No stored preference, detect device language and store it
          const deviceLang = getDeviceLanguage(DEFAULT_LANGUAGE);
          setLanguageState(deviceLang);
          i18n.changeLanguage(deviceLang);
          await AsyncStorage.setItem(LANGUAGE_KEY, deviceLang);
        }

        setIsLoading(false);
      } catch (error) {
        console.error('Error initializing language:', error);
        // Default to Turkish in case of error
        setLanguageState(DEFAULT_LANGUAGE);
        i18n.changeLanguage(DEFAULT_LANGUAGE);
        setIsLoading(false);
      }
    };

    initializeLanguage();
  }, [i18n]);

  return (
    <LanguageContext.Provider value={{language, setLanguage, isLoading}}>
      {children}
    </LanguageContext.Provider>
  );
};

// Custom hook to use the language context
export const useLanguage = () => {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }

  return context;
};
