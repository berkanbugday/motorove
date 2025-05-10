import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import {CommentDetailScreen} from '@screens/comment';
import {MainStackParamList} from '../types/navigationTypes';
import {TabNavigator} from '../tabs/TabNavigator';
import {CreatePostScreen} from '@screens/post';
import {CreateGroupScreen, GroupDetailScreen} from '@screens/group';

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
        name="CommentDetail"
        component={CommentDetailScreen}
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
        name="CreateGroup"
        component={CreateGroupScreen}
        options={{headerShown: false}}
      />

      <Stack.Screen
        name="GroupDetail"
        component={GroupDetailScreen}
        options={{headerShown: false}}
      />
    </Stack.Navigator>
  );
}
