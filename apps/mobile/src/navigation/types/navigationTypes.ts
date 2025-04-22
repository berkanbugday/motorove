import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RouteProp} from '@react-navigation/native';

// AUTH STACK
export type AuthStackParamList = {
  Login: {mode?: 'login' | 'signup'};
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

// MAIN STACK
export type MainStackParamList = {
  Home: undefined;
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
