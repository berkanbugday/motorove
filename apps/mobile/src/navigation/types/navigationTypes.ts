import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RouteProp} from '@react-navigation/native';
import {BottomTabNavigationProp} from '@react-navigation/bottom-tabs';

// AUTH STACK
export type AuthStackParamList = {
  Signin: {mode?: 'signin' | 'signup'};
  Welcome: undefined;
  ForgotPassword: undefined;
  Signup: undefined;
  AccountSetup: {email?: string; fullName?: string};
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
  ExploreTab: undefined;
  GroupsTab: undefined;
  ProfileTab: undefined;
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
  Home: undefined;
  CommentDetail: {postId: string};
  CreatePost: undefined;
  CreateGroup: undefined;
  GroupDetail: {groupId: string};
  EditGroup: {groupId: string};
  // Add more screens here as your app grows
  // Profile: {userId: string};
  // Settings: undefined;
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
