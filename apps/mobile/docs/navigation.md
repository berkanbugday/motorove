# Navigation Structure

This directory contains all the navigation-related code for the application. It follows a modular approach to keep the codebase maintainable and scalable.

## Directory Structure

- `stacks/`: Contains stack navigators for different sections of the app
- `tabs/`: Contains tab-based navigators (to be implemented when needed)
- `utils/`: Utility functions and hooks for navigation (e.g., authentication)
- `types/`: TypeScript type definitions for navigation

## Navigation Flow

```
RootNavigator
├── AuthNavigator (when user is not authenticated)
│   ├── WelcomeScreen (first-time users)
│   ├── LoginScreen
│   └── ForgotPasswordScreen
└── MainNavigator (when user is authenticated)
    └── HomeScreen
    └── (screens to be added)
```

## Best Practices

1. **Screen types**: Define proper types for each screen, including navigation props and route params.
2. **Screen organization**: Keep related screens in their own stacks.
3. **Navigation parameters**: Use typed parameters when navigating between screens.
4. **Screen options**: Set screen options in the navigator rather than in individual screens when possible.
5. **Authentication flow**: Separate authenticated and unauthenticated flows at the root level.

## Usage Example

To navigate between screens:

```typescript
import {useNavigation} from '@react-navigation/native';
import {AuthScreenNavigationProp} from '@navigation/types/navigationTypes';

function MyComponent() {
  // Use the appropriate navigation prop type
  const navigation = useNavigation<AuthScreenNavigationProp<'Login'>>();

  const handlePress = () => {
    navigation.navigate('ForgotPassword');
  };

  return <Button title="Forgot Password" onPress={handlePress} />;
}
```

## Working With Type Safety

The navigation types are set up to provide full type safety:

- `AuthScreenNavigationProp`: For auth-related screens
- `MainScreenNavigationProp`: For main app screens
- `RootScreenNavigationProp`: For the root navigator

Each of these types ensures that you can only navigate to screens that exist in that navigator and that you provide the correct parameters.
