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
  }
  ${USER_FRAGMENT}
`;

// // Queries
// export const GET_MY_FOLLOWERS = gql`
//   query GetMyFollowers($limit: Int, $skip: Int) {
//     myFollowers(limit: $limit, skip: $skip) {
//       ...UserFragment
//     }
//   }
//   ${USER_FRAGMENT}
// `;

// export const GET_MY_FOLLOWING = gql`
//   query GetMyFollowing($limit: Int, $skip: Int) {
//     myFollowing(limit: $limit, skip: $skip) {
//       ...UserFragment
//     }
//   }
//   ${USER_FRAGMENT}
// `;

// export const GET_USER_FOLLOWERS = gql`
//   query GetUserFollowers($userId: ID!, $limit: Int, $skip: Int) {
//     followerUsers(userId: $userId, limit: $limit, skip: $skip) {
//       ...UserFragment
//     }
//   }
//   ${USER_FRAGMENT}
// `;

// export const GET_USER_FOLLOWING = gql`
//   query GetUserFollowing($userId: ID!, $limit: Int, $skip: Int) {
//     followingUsers(userId: $userId, limit: $limit, skip: $skip) {
//       ...UserFragment
//     }
//   }
//   ${USER_FRAGMENT}
// `;

// export const CHECK_IS_FOLLOWING = gql`
//   query CheckIsFollowing($userId: ID!) {
//     isFollowing(userId: $userId)
//   }
// `;

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
