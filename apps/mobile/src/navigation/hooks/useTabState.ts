import {useRoute} from '@react-navigation/native';
import {TabScreenRouteProp} from '../types/navigationTypes';

/**
 * Custom hook to get the current tab state
 * @returns Object with information about the current tab state
 */
export const useTabState = () => {
  // Use the route hook from React Navigation with our custom type
  const route = useRoute<TabScreenRouteProp<any>>();

  // Determine which tab is currently active
  const isHomeTab = route.name === 'HomeTab';
  const isExploreTab = route.name === 'ExploreTab';
  const isProfileTab = route.name === 'ProfileTab';
  const isSettingsTab = route.name === 'SettingsTab';

  // Get current tab name
  const currentTab = route.name;

  return {
    route,
    currentTab,
    isHomeTab,
    isExploreTab,
    isProfileTab,
    isSettingsTab,
  };
};
