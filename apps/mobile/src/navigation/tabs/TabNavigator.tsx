import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';

import {HomeScreen} from '@screens/home';
import {ExploreScreen} from '@screens/explore';
import {ProfileScreen} from '@screens/profile';
import {SettingsScreen} from '@screens/settings';
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
      <Tab.Screen name="ExploreTab" component={ExploreScreen} />
      <Tab.Screen name="SettingsTab" component={SettingsScreen} />
      <Tab.Screen name="ProfileTab" component={ProfileScreen} />
    </Tab.Navigator>
  );
};
