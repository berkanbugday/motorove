/**
 * Notification domain model
 * Based on the backend Notification model
 */

import {NotificationStatus, NotificationType} from '../enums';

/**
 * Basic notification information
 */
export interface Notification {
  id: string;
  title: string;
  body: string;
  data?: string; // JSON string with additional data
  type: NotificationType;
  status: NotificationStatus;
  read: boolean;
  createdAt: string;
}

/**
 * Notification with relations
 */
export interface NotificationWithRelations extends Notification {
  user?: any; // Will define proper User type
}
