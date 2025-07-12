# Motorove Multi-Language Support

This directory contains the multi-language implementation for the Motorove mobile app. The app supports both English (en) and Turkish (tr) languages, and automatically detects the device language.

## Structure

- `i18n.ts`: Main configuration file for i18n initialization
- `locales/`: Directory containing language translation files
  - `en.ts`: English translations
  - `tr.ts`: Turkish translations
  - `index.ts`: Exports the resources for all languages

## How to Use

### In Components

```tsx
import {useTranslation} from '@/hooks/useTranslation';

const MyComponent = () => {
  // Get the translation function and language utilities
  const {t, language, setLanguage} = useTranslation();

  return (
    <View>
      {/* Use translations */}
      <Text>{t('common.hello')}</Text>
      <Text>{t('common.welcome')}</Text>

      {/* Access current language */}
      <Text>Current language: {language}</Text>

      {/* Change language */}
      <Button title="Switch to Turkish" onPress={() => setLanguage('tr')} />
    </View>
  );
};
```

### Adding New Translations

1. Add new translation keys to both `en.ts` and `tr.ts` files
2. Use the same nested object structure for consistency
3. Follow the existing naming conventions

Example:

```typescript
// In en.ts
export default {
  // ... existing translations
  newFeature: {
    title: 'New Feature',
    description: 'This is a new feature',
  },
};

// In tr.ts
export default {
  // ... existing translations
  newFeature: {
    title: 'Yeni Özellik',
    description: 'Bu yeni bir özelliktir',
  },
};
```

### Supporting Additional Languages

To add support for additional languages:

1. Create a new file in `locales/` for the language (e.g., `de.ts` for German)
2. Add the language to the resources in `locales/index.ts`
3. Update the Language enum in `shared/enums/language.enum.ts`

## Language Selection

Users can change the app language using the `LanguageSelector` component found in the "More" screen. The selected language preference is saved to AsyncStorage and persists across app restarts.
