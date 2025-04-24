import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import {HomeScreen} from '@screens/home';
import {CommentDetailScreen} from '@screens/comments';
import {MainStackParamList} from '../types/navigationTypes';
import {TabNavigator} from '../tabs/TabNavigator';

const Stack = createNativeStackNavigator<MainStackParamList>();

/**
 * Main navigation stack - shown when user IS authenticated
 * Contains the main app screens like Home, Profile, Settings, etc.
 */
export function MainNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Tabs"
      screenOptions={{
        headerShown: false,
      }}>
      <Stack.Screen name="Tabs" component={TabNavigator} />

      {/* Individual screens that can be navigated to from tabs */}
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: 'Motorove',
          headerShown: true,
        }}
      />

      <Stack.Screen
        name="CommentDetail"
        component={CommentDetailScreen}
        options={{
          headerShown: false,
        }}
      />

      {/* Add more screens here as your app grows */}
      {/* Example:
      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: 'My Profile',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          title: 'Settings',
          headerShown: true,
        }}
      />
      */}
    </Stack.Navigator>
  );
}
