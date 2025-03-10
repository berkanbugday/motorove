import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {ProfileScreen} from '../screens/ProfileScreen';
import {EditProfileScreen} from '../screens/EditProfileScreen';
import {NotificationsScreen} from '../screens/NotificationsScreen';
import {PrivacySecurityScreen} from '../screens/PrivacySecurityScreen';
import {HelpSupportScreen} from '../screens/HelpSupportScreen';

export type ProfileStackParamList = {
  Profile: undefined;
  EditProfile: undefined;
  Notifications: undefined;
  PrivacySecurity: undefined;
  HelpSupport: undefined;
};

const Stack = createNativeStackNavigator<ProfileStackParamList>();

export function ProfileStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#FFFFFF',
        },
        headerShadowVisible: false,
        headerTitleStyle: {
          fontSize: 18,
          fontWeight: '600',
          color: '#333',
        },
        headerTintColor: '#007AFF',
      }}>
      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="EditProfile"
        component={EditProfileScreen}
        options={{title: 'Edit Profile'}}
      />
      <Stack.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{title: 'Notifications'}}
      />
      <Stack.Screen
        name="PrivacySecurity"
        component={PrivacySecurityScreen}
        options={{title: 'Privacy & Security'}}
      />
      <Stack.Screen
        name="HelpSupport"
        component={HelpSupportScreen}
        options={{title: 'Help & Support'}}
      />
    </Stack.Navigator>
  );
}
