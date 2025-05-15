import {gql} from '@apollo/client';

// Notification fragments
export const NOTIFICATION_FRAGMENT = gql`
  fragment NotificationFragment on Notification {
    id
    title
    body
    type
    data
    status
    read
    createdAt
    updatedAt
  }
`;

// Queries
export const GET_USER_NOTIFICATIONS = gql`
  query GetUserNotifications($userId: String!, $limit: Int, $skip: Int) {
    getUserNotifications(userId: $userId, limit: $limit, skip: $skip) {
      ...NotificationFragment
    }
  }
  ${NOTIFICATION_FRAGMENT}
`;

// Mutations
export const SAVE_DEVICE_TOKEN = gql`
  mutation SaveDeviceToken($deviceTokenInput: DeviceTokenInput!) {
    saveDeviceToken(deviceTokenInput: $deviceTokenInput)
  }
`;

export const REMOVE_DEVICE_TOKEN = gql`
  mutation RemoveDeviceToken($userId: String!, $token: String!) {
    removeDeviceToken(userId: $userId, token: $token)
  }
`;

export const MARK_NOTIFICATION_AS_READ = gql`
  mutation MarkNotificationAsRead($id: ID!) {
    markNotificationAsRead(id: $id) {
      id
      read
    }
  }
`;

export const MARK_ALL_NOTIFICATIONS_AS_READ = gql`
  mutation MarkAllNotificationsAsRead($userId: String!) {
    markAllNotificationsAsRead(userId: $userId)
  }
`;
