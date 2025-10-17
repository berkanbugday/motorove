import {
  NotificationPermission,
  NotificationType,
  Language,
} from "../../enums";

/**
 * Update User Setting Interface
 * Used for updating existing user settings
 */
export interface IUpdateUserSetting {
  /**
   * Auto accept followers
   */
  autoAcceptFollowers?: boolean;

  /**
   * Preferred language for notifications and app content
   */
  preferredLanguage?: Language;

  /**
   * Notification permission
   */
  notificationPermission?: NotificationPermission;

  /**
   * Notification preferences
   */
  notificationPreferences?: Record<NotificationType, boolean>;
}
