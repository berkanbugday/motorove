import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RouteProp} from '@react-navigation/native';
import {BottomTabNavigationProp} from '@react-navigation/bottom-tabs';

/**
 * Authentication stack navigation types
 */
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

/**
 * Tab navigation types
 */
export type TabParamList = {
  HomeTab: undefined;
  SearchTab: undefined;
  MapTab: undefined;
  GroupsTab: undefined;
  MoreTab: undefined;
};

export type TabScreenNavigationProp<T extends keyof TabParamList> =
  BottomTabNavigationProp<TabParamList, T>;

export type TabScreenRouteProp<T extends keyof TabParamList> = RouteProp<
  TabParamList,
  T
>;

/**
 * Main stack navigation types
 */
export type MainStackParamList = {
  Tabs: undefined;
  Home: undefined;
  Comment: {postId: string};
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

/**
 * Root navigator types
 */
export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
};

export type RootScreenNavigationProp<T extends keyof RootStackParamList> =
  NativeStackNavigationProp<RootStackParamList, T>;
