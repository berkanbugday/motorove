import React, {useEffect} from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import {MainStackParamList} from '../types/navigationTypes';
import {TabNavigator} from '../tabs/TabNavigator';
import {
  CreatePostScreen,
  CommentScreen,
  EditPostScreen,
  PostScreen,
} from '@screens/post';
import {
  CreateGroupScreen,
  GroupDetailScreen,
  EditGroupScreen,
  SearchGroupScreen,
} from '@screens/group';
import {SearchUserScreen} from '@screens/searchUser';
import {
  CreateEventScreen,
  EventScreen,
  EventDetailScreen,
} from '@screens/event';
import {NotificationScreen} from '@screens/notification';
import {
  ProfileScreen,
  PrivacySettingScreen,
  NotificationSettingScreen,
  FollowRequestScreen,
  JoinRequestScreen,
  SupportScreen,
} from '@screens/menu';
import {GarageScreen} from '@screens/garage';
import {
  // notificationService,
  // useSaveDeviceToken,
  useRemoveDeviceToken,
} from '@services/notification.service';
import {useAuth} from '@contexts/AuthContext';
import {NotificationPermission} from '@motorove/shared';
import {useNotificationPermission} from '@hooks/useNotificationPermission';

const Stack = createNativeStackNavigator<MainStackParamList>();

/**
 * Main navigation stack - shown when user IS authenticated
 * Contains the main app screens like Home, Profile, Settings, etc.
 */
export function MainNavigator() {
  const {updateNotificationPermission} = useAuth();
  // const {saveDeviceToken} = useSaveDeviceToken();
  const {removeDeviceToken} = useRemoveDeviceToken();
  const {status, requestPermission} = useNotificationPermission();

  useEffect(() => {
    const init = async (): Promise<void> => {
      console.log('status', status);
      if (status === 'unavailable') {
        requestPermission();
      } else if (status !== 'requesting') {
        if (status === 'granted') {
          await requestPermission();
        } else {
          await updateNotificationPermission(
            NotificationPermission.NOT_ALLOWED,
          );
          await removeDeviceToken();
        }
      }
    };

    init();
  }, [status, requestPermission]);

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
        name="SearchGroup"
        component={SearchGroupScreen}
        options={{headerShown: false}}
      />

      <Stack.Screen
        name="SearchUser"
        component={SearchUserScreen}
        options={{headerShown: false}}
      />

      <Stack.Screen
        name="Notification"
        component={NotificationScreen}
        options={{headerShown: false}}
      />

      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{headerShown: false}}
      />

      <Stack.Screen
        name="JoinRequest"
        component={JoinRequestScreen}
        options={{headerShown: false}}
      />

      <Stack.Screen
        name="PrivacySetting"
        component={PrivacySettingScreen}
        options={{headerShown: false}}
      />

      <Stack.Screen
        name="NotificationSetting"
        component={NotificationSettingScreen}
        options={{headerShown: false}}
      />

      <Stack.Screen
        name="FollowRequest"
        component={FollowRequestScreen}
        options={{headerShown: false}}
      />

      <Stack.Screen
        name="Support"
        component={SupportScreen}
        options={{headerShown: false}}
      />

      <Stack.Screen
        name="Posts"
        component={PostScreen}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="Events"
        component={EventScreen}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="EventDetail"
        component={EventDetailScreen}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="Garage"
        component={GarageScreen}
        options={{headerShown: false}}
      />
    </Stack.Navigator>
  );
}
