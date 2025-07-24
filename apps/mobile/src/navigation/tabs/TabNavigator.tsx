import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';

import {HomeScreen} from '@screens/home';
import {MapScreen} from '@screens/map';
import {MoreScreen} from '@screens/more';
import {GroupScreen} from '@screens/group';
import {SearchUserScreen} from '@screens/searchUser';
import {TabParamList} from '../types/navigationTypes';
import {CustomTabBar} from './CustomTabBar';

const Tab = createBottomTabNavigator<TabParamList>();

interface TabNavigatorProps {
  useCustomTabBar?: boolean;
}

// Define tab bar renderer outside component
const renderCustomTabBar = (props: any) => <CustomTabBar {...props} />;

/**
 * Main Tab Navigator
 * Handles the bottom tabs for the main app navigation
 */
export const TabNavigator: React.FC<TabNavigatorProps> = ({
  useCustomTabBar = true,
}) => {
  return (
    <Tab.Navigator
      screenOptions={() => ({
        headerShown: false,
      })}
      tabBar={useCustomTabBar ? renderCustomTabBar : undefined}>
      <Tab.Screen name="HomeTab" component={HomeScreen} />
      <Tab.Screen name="SearchTab" component={SearchUserScreen} />
      <Tab.Screen name="MapTab" component={MapScreen} />
      <Tab.Screen name="GroupsTab" component={GroupScreen} />
      <Tab.Screen name="MoreTab" component={MoreScreen} />
    </Tab.Navigator>
  );
};
