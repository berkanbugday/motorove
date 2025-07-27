import {gql} from '@apollo/client';
import {USER_FRAGMENT} from './user.graphql';

// Fragment
export const USER_FOLLOWING_FRAGMENT = gql`
  fragment UserFollowingFragment on UserFollowingDto {
    id
    follower {
      ...UserFragment
    }
    following {
      ...UserFragment
    }
    createdAt
    updatedAt
    status
  }
  ${USER_FRAGMENT}
`;

// Get pending follow requests query
export const GET_PENDING_FOLLOW_REQUESTS = gql`
  query GetPendingFollowRequests($limit: Int, $skip: Int) {
    pendingFollowRequests(limit: $limit, skip: $skip) {
      ...UserFollowingFragment
    }
  }
  ${USER_FOLLOWING_FRAGMENT}
`;

// Mutations
export const FOLLOW_USER = gql`
  mutation FollowUser($userId: ID!) {
    followUser(userId: $userId)
  }
`;

export const UNFOLLOW_USER = gql`
  mutation UnfollowUser($userId: ID!) {
    unfollowUser(userId: $userId)
  }
`;

export const UPDATE_USER_FOLLOWING_INVITATION_STATUS = gql`
  mutation UpdateUserFollowingInvitationStatus(
    $input: UpdateUserFollowingInvitationStatusInput!
  ) {
    updateUserFollowingInvitationStatus(input: $input) {
      status
    }
  }
`;
