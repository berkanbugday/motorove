import {NavigationProp, ParamListBase} from '@react-navigation/native';

/**
 * Helper function to navigate across stacks safely
 * Attempts to navigate with the provided navigation object first,
 * and if that fails, attempts to navigate using the parent navigator
 *
 * @param navigation The navigation object
 * @param screenName Name of the screen to navigate to
 * @param params Parameters to pass to the screen
 */
export function navigateToScreen(
  navigation: NavigationProp<ParamListBase>,
  screenName: string,
  params?: object,
) {
  // Try to directly navigate using the current navigator
  try {
    // @ts-ignore - This works at runtime even if TypeScript doesn't recognize the screen
    navigation.navigate(screenName, params);
  } catch (error) {
    // If that fails, try the parent navigator
    const parentNav = navigation.getParent();
    if (parentNav) {
      try {
        // @ts-ignore - This works at runtime even if TypeScript doesn't recognize the screen
        parentNav.navigate(screenName, params);
      } catch (innerError) {
        console.warn(`Failed to navigate to ${screenName}`, innerError);
      }
    } else {
      console.warn(
        `No parent navigator available to navigate to ${screenName}`,
      );
    }
  }
}
