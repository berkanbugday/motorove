import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RouteProp} from '@react-navigation/native';
import {BottomTabNavigationProp} from '@react-navigation/bottom-tabs';

// AUTH STACK
export type AuthStackParamList = {
  Signin: undefined;
  Welcome: undefined;
  ResetPassword: undefined;
  UpdatePassword: {email?: string; token?: string};
  Signup: undefined;
  AccountSetup: {email?: string; firstName?: string; lastName?: string};
  NotificationPermission: undefined;
};

export type AuthScreenNavigationProp<T extends keyof AuthStackParamList> =
  NativeStackNavigationProp<AuthStackParamList, T>;

export type AuthScreenRouteProp<T extends keyof AuthStackParamList> = RouteProp<
  AuthStackParamList,
  T
>;

// TAB NAVIGATION
export type TabParamList = {
  HomeTab: undefined;
  SearchTab: undefined;
  MapTab: undefined;
  GroupsTab: undefined;
  MenuTab: undefined;
};

export type TabScreenNavigationProp<T extends keyof TabParamList> =
  BottomTabNavigationProp<TabParamList, T>;

export type TabScreenRouteProp<T extends keyof TabParamList> = RouteProp<
  TabParamList,
  T
>;

// MAIN STACK
export type MainStackParamList = {
  Tabs: undefined;
  Comment: {postId: string};
  CreatePost: undefined;
  EditPost: {postId: string};
  CreateGroup: undefined;
  CreateEvent: undefined;
  GroupDetail: {groupId: string};
  EditGroup: {groupId: string};
  EventDetail: {eventId: string};
  SearchGroup: undefined;
  SearchUser: undefined;
  Notification: undefined;
  Profile: {userId?: string};
  JoinRequest: undefined;
  PrivacySetting: undefined;
  NotificationSetting: undefined;
  FollowRequest: undefined;
  Support: undefined;
  Posts: undefined;
  Events: undefined;
};

export type MainScreenNavigationProp<T extends keyof MainStackParamList> =
  NativeStackNavigationProp<MainStackParamList, T>;

export type MainScreenRouteProp<T extends keyof MainStackParamList> = RouteProp<
  MainStackParamList,
  T
>;

// ROOT NAVIGATOR - Define which stacks will be in the root navigation
export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
};

export type RootScreenNavigationProp<T extends keyof RootStackParamList> =
  NativeStackNavigationProp<RootStackParamList, T>;
