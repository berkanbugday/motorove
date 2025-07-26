import { NotificationPermission, NotificationType } from "../../enums";

/**
 * Update User Setting Interface
 * Used for updating existing user settings
 */
export interface IUpdateUserSetting {
  /**
   * ID to identify which user setting to update
   */
  id: string;
  /**
   * Auto accept followers
   */
  autoAcceptFollowers?: boolean;

  /**
   * Notification permission
   */
  notificationPermission?: NotificationPermission;

  /**
   * Notification preferences
   */
  notificationPreferences?: Record<NotificationType, boolean>;
}
