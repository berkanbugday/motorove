import {useNavigation} from '@react-navigation/native';
import {TabScreenNavigationProp} from '../types/navigationTypes';

/**
 * Custom hook for tab navigation that provides typed navigation functions
 * @returns Navigation object with tab-specific navigation functions
 */
export const useTabNavigation = () => {
  // Use generic navigation hook from React Navigation with our custom type
  const navigation = useNavigation<TabScreenNavigationProp<any>>();

  /**
   * Navigate to a specific tab
   * @param tabName Name of the tab to navigate to
   */
  const navigateToTab = (
    tabName: 'HomeTab' | 'ExploreTab' | 'GroupTab' | 'ProfileTab',
  ) => {
    navigation.navigate(tabName);
  };

  /**
   * Reset navigation state and navigate to a specific tab
   * @param tabName Name of the tab to navigate to
   */
  const resetToTab = (
    tabName: 'HomeTab' | 'ExploreTab' | 'GroupTab' | 'ProfileTab',
  ) => {
    navigation.reset({
      index: 0,
      routes: [{name: tabName}],
    });
  };

  /**
   * Navigate to the home tab
   */
  const goToHome = () => navigateToTab('HomeTab');

  /**
   * Navigate to the explore tab
   */
  const goToExplore = () => navigateToTab('ExploreTab');

  /**
   * Navigate to the group tab
   */
  const goToGroup = () => navigateToTab('GroupTab');

  /**
   * Navigate to the profile tab
   */
  const goToProfile = () => navigateToTab('ProfileTab');

  return {
    navigation,
    navigateToTab,
    resetToTab,
    goToHome,
    goToExplore,
    goToProfile,
    goToGroup,
  };
};
