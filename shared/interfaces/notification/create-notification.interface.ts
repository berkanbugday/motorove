import { NotificationType } from "../../enums/notification-type.enum";

/**
 * Create Notification Interface
 * Used for creating a single notification
 */
export interface ICreateNotification {
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
   * User ID of the notification recipient
   */
  userId: string;

  /**
   * Additional data for the notification (JSON stored as string)
   */
  data?: Record<string, any>;
}
