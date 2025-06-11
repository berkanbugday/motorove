import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import {MainStackParamList} from '../types/navigationTypes';
import {TabNavigator} from '../tabs/TabNavigator';
import {CreatePostScreen, CommentScreen, EditPostScreen} from '@screens/post';
import {
  CreateGroupScreen,
  GroupDetailScreen,
  EditGroupScreen,
  GroupSearchScreen,
} from '@screens/group';
import {CreateEventScreen} from '@screens/event';
import {NotificationScreen} from '@screens/notification';

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
        name="Comment"
        component={CommentScreen}
        options={{
          headerShown: false,
        }}
      />

      <Stack.Screen
        name="CreatePost"
        component={CreatePostScreen}
        options={{headerShown: false}}
      />

      <Stack.Screen
        name="EditPost"
        component={EditPostScreen}
        options={{headerShown: false}}
      />

      <Stack.Screen
        name="CreateGroup"
        component={CreateGroupScreen}
        options={{headerShown: false}}
      />

      <Stack.Screen
        name="CreateEvent"
        component={CreateEventScreen}
        options={{headerShown: false}}
      />

      <Stack.Screen
        name="GroupDetail"
        component={GroupDetailScreen}
        options={{headerShown: false}}
      />

      <Stack.Screen
        name="EditGroup"
        component={EditGroupScreen}
        options={{headerShown: false}}
      />

      <Stack.Screen
        name="GroupSearch"
        component={GroupSearchScreen}
        options={{headerShown: false}}
      />

      <Stack.Screen
        name="Notification"
        component={NotificationScreen}
        options={{headerShown: false}}
      />
    </Stack.Navigator>
  );
}
