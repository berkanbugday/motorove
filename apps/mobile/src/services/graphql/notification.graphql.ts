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
export const GET_NOTIFICATIONS = gql`
  query GetNotifications($limit: Int, $skip: Int) {
    notifications(limit: $limit, skip: $skip) {
      ...NotificationFragment
    }
  }
  ${NOTIFICATION_FRAGMENT}
`;

// Mutations
export const SAVE_DEVICE_TOKEN = gql`
  mutation SaveDeviceToken($input: DeviceTokenInput!) {
    saveDeviceToken(deviceTokenInput: $input)
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

export const GET_NOTIFICATIONS_COUNT = gql`
  query GetNotificationsCount($onlyUnread: Boolean) {
    notificationsCount(onlyUnread: $onlyUnread)
  }
`;
