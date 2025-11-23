/**
 * Authentication-related types and interfaces
 */

import {NotificationPermission, Language} from '@motorove/shared';

/**
 * User entity interface
 */
export interface AuthUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  avatar?: string | null;
  hasCompletedSetup?: boolean;
  notificationPermission?: NotificationPermission;
  preferredLanguage?: Language;
}

export interface AuthContextType extends AuthUser {
  signIn: (email: string, password: string) => Promise<AuthUser>;
  signUp: (
    firstName: string,
    lastName: string,
    email: string,
    password: string,
  ) => Promise<boolean>;
  signOut: () => Promise<void>;
  loadAuthUser: () => Promise<void>;
}
