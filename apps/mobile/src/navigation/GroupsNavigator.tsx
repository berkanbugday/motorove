import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {GroupsScreen} from '../screens/GroupsScreen';
import GroupDetailScreen from '../screens/GroupDetailScreen';

const Stack = createNativeStackNavigator();

export function GroupsNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}>
      <Stack.Screen
        name="GroupsList"
        component={GroupsScreen}
        options={{
          title: 'Groups',
        }}
      />
      <Stack.Screen
        name="GroupDetail"
        component={GroupDetailScreen}
        options={{
          title: 'Group Details',
        }}
      />
    </Stack.Navigator>
  );
}
