import {
  NotificationPermission,
  NotificationType,
  Language,
} from "../../enums";

/**
 * User Setting Interface
 * Used for representing user settings
 */
export interface IUserSetting {
  /**
   * Auto accept followers
   */
  autoAcceptFollowers: boolean;

  /**
   * Preferred language for notifications and app content
   */
  preferredLanguage: Language;

  /**
   * Notification permission
   */
  notificationPermission: NotificationPermission;

  /**
   * Notification preferences
   */
  notificationPreferences?: Record<NotificationType, boolean>;
}
