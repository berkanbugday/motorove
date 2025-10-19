import { NotificationType } from "../../enums/notification-type.enum";

/**
 * Create Notifications Interface
 * Used for creating multiple notifications at once
 */
export interface ICreateNotifications {
  /**
   * List of user IDs to send notifications to
   */
  userIds: string[];

  /**
   * Title of the notification
   */
  title: string;

  /**
   * Body content of the notification
   */
  body: string;

  /**
   * Type of the notification
   */
  type: NotificationType;

  /**
   * Additional data for the notification (JSON stored as string)
   */
  data?: Record<string, any>;
}
