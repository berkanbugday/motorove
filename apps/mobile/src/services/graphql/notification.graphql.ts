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

export const DELETE_NOTIFICATION = gql`
  mutation DeleteNotification($id: ID!) {
    deleteNotification(id: $id) {
      id
    }
  }
`;

export const DELETE_ALL_NOTIFICATIONS = gql`
  mutation DeleteAllNotifications {
    deleteAllNotifications
  }
`;

// Mutations
export const SAVE_DEVICE_TOKEN = gql`
  mutation SaveDeviceToken($input: CreateDeviceTokenInput!) {
    saveDeviceToken(input: $input)
  }
`;

export const REMOVE_DEVICE_TOKEN = gql`
  mutation RemoveDeviceToken {
    removeDeviceToken
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
    markAllNotificationsAsRead(userId: $userId) {
      id
      read
    }
  }
`;

export const GET_COUNT = gql`
  query Count {
    count
  }
`;
