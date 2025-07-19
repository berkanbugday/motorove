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

The app automatically detects the device language and uses it if supported. Users can manually change the language through the settings screen using the `LanguageSelector` component.

## Best Practices

### 1. Translation Key Naming Convention

Use descriptive, hierarchical keys that reflect the component structure:

```typescript
// Good
t('screens.home.welcome_message');
t('components.button.loading');
t('validation.email.required');

// Avoid
t('welcome');
t('loading');
t('required');
```

### 2. Component Organization

Organize translations by component or screen:

```typescript
// For screens
screens: {
  home: {
    welcome_message: 'Welcome to Motorove',
    no_posts_available: 'No posts available',
  },
  profile: {
    edit_profile: 'Edit Profile',
    followers: 'Followers',
  },
}

// For components
components: {
  button: {
    loading: 'Loading...',
  },
  dropdown: {
    no_results: 'No results found',
  },
}
```

### 3. Common Translations

Use the `common` section for frequently used words and phrases:

```typescript
common: {
  ok: 'OK',
  cancel: 'Cancel',
  save: 'Save',
  delete: 'Delete',
  loading: 'Loading...',
}
```

### 4. Validation Messages

Keep validation messages in a dedicated section:

```typescript
validation: {
  email: {
    required: 'Email is required',
    invalid: 'Email is invalid',
  },
  password: {
    required: 'Password is required',
    min_length: 'Password must be at least 6 characters',
  },
}
```

### 5. Error Messages

Organize error messages by category:

```typescript
errors: {
  auth: {
    invalid_credentials: 'Invalid email or password!',
    session_expired: 'Your session has expired. Please sign in again.',
  },
  network: {
    default: 'Network connection is unavailable',
    timeout: 'The request timed out. Please try again.',
  },
}
```

### 6. Interpolation

Use interpolation for dynamic values:

```typescript
// In translation file
max_items_reached: 'Maximum {{count}} items can be selected';

// In component
t('components.multiSelect.max_items_reached', {count: 5});
```

### 7. Pluralization

For pluralization, use interpolation with conditional logic:

```typescript
// In translation file
items_count: '{{count}} item',
items_count_plural: '{{count}} items',

// In component
const count = 5;
const text = count === 1
  ? t('items_count', {count})
  : t('items_count_plural', {count});
```

## Implementation Guidelines

### 1. Always Use Translation Keys

Never use hardcoded strings in components:

```typescript
// ❌ Bad
<Text>Welcome to Motorove</Text>

// ✅ Good
<Text>{t('screens.home.welcome_message')}</Text>
```

### 2. Use the Custom Hook

Always use the custom `useTranslation` hook instead of the raw `react-i18next` hook:

```typescript
// ❌ Bad
import {useTranslation} from 'react-i18next';

// ✅ Good
import {useTranslation} from '@/hooks/useTranslation';
```

### 3. Handle Loading States

Consider the language loading state in your components:

```typescript
const {language, setLanguage, isLoading} = useLanguage();

if (isLoading) {
  return <LoadingSpinner />;
}
```

### 4. Test Both Languages

Always test your components in both supported languages to ensure proper text fitting and layout.

### 5. Consider Text Length

Different languages have different text lengths. Design your UI to accommodate longer text:

```typescript
// Use flexbox or dynamic sizing
<Text numberOfLines={2} style={{flexShrink: 1}}>
  {t('some.long.translation.key')}
</Text>
```

## Troubleshooting

### Common Issues

1. **Translation not found**: Check if the key exists in both language files
2. **Language not changing**: Ensure the `LanguageProvider` is wrapping your app
3. **Device language not detected**: Check the `languageUtils.ts` file for supported languages

### Debugging

Enable debug mode in development:

```typescript
// In i18n.ts
i18n.use(initReactI18next).init({
  // ... other config
  debug: __DEV__, // Enable debug in development
});
```

## Performance Considerations

1. **Lazy Loading**: Consider lazy loading translation files for large apps
2. **Bundle Size**: Keep translation files organized and avoid duplication
3. **Caching**: The app caches language preferences in AsyncStorage

## Migration Guide

When migrating existing components to use translations:

1. Identify all hardcoded strings
2. Create appropriate translation keys
3. Replace hardcoded strings with `t()` calls
4. Test in both languages
5. Update documentation

## Contributing

When adding new features:

1. Add translations for all new text
2. Follow the naming conventions
3. Test in both languages
4. Update this documentation if needed
