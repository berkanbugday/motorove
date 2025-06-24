import {useCallback} from 'react';
import {useNavigation} from '@react-navigation/native';
import {TabScreenNavigationProp} from '../types/navigationTypes';

/**
 * Custom hook for managing tab badges
 * @returns Object with functions to update tab badges
 */
export const useTabBadge = () => {
  const navigation = useNavigation<TabScreenNavigationProp<any>>();

  /**
   * Set a badge value for a specific tab
   * @param tabName Name of the tab to set the badge for
   * @param count Badge count value (set to undefined to hide badge)
   */
  const setTabBadge = useCallback(
    (
      tabName: 'HomeTab' | 'SearchTab' | 'MapTab' | 'GroupsTab' | 'MoreTab',
      count: number | undefined,
    ) => {
      navigation.setOptions({
        tabBarBadge: count,
      });
    },
    [navigation],
  );

  /**
   * Set a badge for the home tab
   * @param count Badge count value (set to undefined to hide badge)
   */
  const setHomeBadge = useCallback(
    (count: number | undefined) => {
      setTabBadge('HomeTab', count);
    },
    [setTabBadge],
  );

  /**
   * Set a badge for the search tab
   * @param count Badge count value (set to undefined to hide badge)
   */
  const setSearchBadge = useCallback(
    (count: number | undefined) => {
      setTabBadge('SearchTab', count);
    },
    [setTabBadge],
  );

  /**
   * Set a badge for the map tab
   * @param count Badge count value (set to undefined to hide badge)
   */
  const setMapBadge = useCallback(
    (count: number | undefined) => {
      setTabBadge('MapTab', count);
    },
    [setTabBadge],
  );

  /**
   * Set a badge for the more tab
   * @param count Badge count value (set to undefined to hide badge)
   */
  const setMoreBadge = useCallback(
    (count: number | undefined) => {
      setTabBadge('MoreTab', count);
    },
    [setTabBadge],
  );

  /**
   * Set a badge for the group tab
   * @param count Badge count value (set to undefined to hide badge)
   */
  const setGroupBadge = useCallback(
    (count: number | undefined) => {
      setTabBadge('GroupsTab', count);
    },
    [setTabBadge],
  );

  return {
    setTabBadge,
    setHomeBadge,
    setSearchBadge,
    setMapBadge,
    setMoreBadge,
    setGroupBadge,
  };
};
