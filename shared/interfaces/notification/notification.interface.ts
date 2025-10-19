import { NotificationStatus } from "../../enums/notification-status.enum";
import { NotificationType } from "../../enums/notification-type.enum";

/**
 * Notification Interface
 * Represents a notification entity
 */
export interface INotification {
  /**
   * Unique identifier for the notification
   */
  id: string;

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

  /**
   * Status of the notification
   */
  status: NotificationStatus;

  /**
   * Whether the notification has been read
   */
  read: boolean;

  /**
   * Creation timestamp
   */
  createdAt: Date;
}
