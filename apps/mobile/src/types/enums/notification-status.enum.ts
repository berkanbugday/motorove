/**
 * Notification Status Enum
 * Matches backend NotificationStatus enum
 * The status of a notification
 */
export enum NotificationStatus {
  PENDING = 'PENDING',
  SENT = 'SENT',
  NOT_SENT = 'NOT_SENT',
  DELIVERED = 'DELIVERED',
  FAILED = 'FAILED',
}
