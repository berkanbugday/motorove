import {gql} from '@apollo/client';
import {CITY_FRAGMENT} from './city.graphql';

export const USER_BLOCK_FRAGMENT = gql`
  fragment UserBlockFragment on UserBlockDto {
    id
    createdAt
    blocked {
      id
      firstName
      lastName
      avatar
      city {
        ...CityFragment
      }
    }
  }
  ${CITY_FRAGMENT}
`;

export const BLOCK_USER = gql`
  mutation BlockUser($blockedUserId: ID!) {
    blockUser(blockedUserId: $blockedUserId)
  }
`;

export const UNBLOCK_USER = gql`
  mutation UnblockUser($blockedUserId: ID!) {
    unblockUser(blockedUserId: $blockedUserId)
  }
`;

export const GET_BLOCKED_USERS = gql`
  query GetBlockedUsers {
    blockedUsers {
      ...UserBlockFragment
    }
  }
  ${USER_BLOCK_FRAGMENT}
`;

export const IS_USER_BLOCKED = gql`
  query IsUserBlocked($userId: ID!) {
    isUserBlocked(userId: $userId)
  }
`;
