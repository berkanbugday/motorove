import {AuthUser} from '../../types/auth.types';
import {Language, NotificationPermission} from '@motorove/shared';

/**
 * Create empty auth state
 */
export function createEmptyAuthUser(): AuthUser {
  return {
    id: '',
    email: '',
    firstName: '',
    lastName: '',
    avatar: null,
    hasCompletedSetup: false,
    notificationPermission: NotificationPermission.UNKNOWN,
    preferredLanguage: Language.EN,
  };
}

export function isValidAuthUser(user: AuthUser): boolean {
  return !!(user && user.id && user.hasCompletedSetup);
}
