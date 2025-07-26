import { NotificationPermission, NotificationType } from "../../enums";

/**
 * User Setting Interface
 * Used for representing user settings
 */
export interface IUserSetting {
  /**
   * ID to identify which user setting to update
   */
  id: string;
  /**
   * Auto accept followers
   */
  autoAcceptFollowers: boolean;

  /**
   * Notification permission
   */
  notificationPermission: NotificationPermission;

  /**
   * Notification preferences
   */
  notificationPreferences?: Record<NotificationType, boolean>;
}
