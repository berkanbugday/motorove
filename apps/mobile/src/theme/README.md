# Theme System

This directory contains a complete design system for the Motorove mobile app. The theme system helps maintain a consistent design across the application by centralizing colors, sizes, typography, and other common properties.

## Structure

- **colors.ts**: Defines the app's color palette
- **spacing.ts**: Defines spacing/margin/padding values
- **typography.ts**: Defines text styles, font sizes, and font weights
- **radius.ts**: Defines border radius values
- **shadows.ts**: Defines shadow styles for different elevations
- **responsive.ts**: Provides utilities for responsive sizing
- **commonStyles.ts**: Contains reusable styles
- **index.ts**: Exports everything for easy importing

## How to Use

### Basic Import

Import any theme components you need:

```tsx
import {colors, spacing, typography} from '../theme';

// Use in your styles
const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.neutral.white,
    padding: spacing.md,
  },
  text: {
    fontSize: typography.body.fontSize,
    fontWeight: typography.body.fontWeight as TextStyle['fontWeight'],
    color: colors.neutral.black,
  },
});
```

### Or Import Everything

You can import the entire theme:

```tsx
import theme from '../theme';

// Use in your styles
const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.neutral.white,
    padding: theme.spacing.md,
  },
});
```

### Using Common Styles

The theme includes common, reusable styles:

```tsx
import {commonStyles} from '../theme';

// Use in your component
<View style={[commonStyles.container, commonStyles.center]}>
  <Text style={commonStyles.textCenter}>Centered Text</Text>
</View>;
```

### Responsive Sizing

Use the responsive utilities to ensure your UI works on different device sizes:

```tsx
import {rs, rw, rh, rf} from '../theme';

const styles = StyleSheet.create({
  box: {
    width: rw(150), // Responsive width
    height: rh(100), // Responsive height
    padding: rs(16), // Responsive general sizing
    borderRadius: rs(8),
  },
  text: {
    fontSize: rf(16), // Responsive font size
  },
});
```

### Shadows

Use the shadow utilities to add elevation:

```tsx
import {getShadow} from '../theme';

const styles = StyleSheet.create({
  card: {
    ...getShadow('medium'), // Automatically applies the right shadow for iOS/Android
  },
});
```

## Best Practices

1. **Always use theme values instead of hardcoded values** - This ensures design consistency
2. **Keep component styles in sync with the theme** - When the theme changes, your components will update consistently
3. **Use responsive sizing for layout** - This ensures your app looks good on various device sizes
4. **Use common styles when possible** - Reduces duplication and enhances consistency
5. **Consider theme updates carefully** - Changes to the theme will affect the entire app

## Extending the Theme

When you need to add new theme properties:

1. Add the new values to the appropriate theme file
2. Export the values and types from that file
3. Update the index.ts file to include the new exports
4. Use the new theme values in your components

By following this guide, you'll help maintain a consistent and visually appealing user experience across the app.
