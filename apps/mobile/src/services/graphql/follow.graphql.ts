import {gql} from '@apollo/client';
import {USER_FRAGMENT} from './user.graphql';

// Queries
export const GET_MY_FOLLOWERS = gql`
  query GetMyFollowers($limit: Int, $skip: Int) {
    myFollowers(limit: $limit, skip: $skip) {
      ...UserFragment
    }
  }
  ${USER_FRAGMENT}
`;

export const GET_MY_FOLLOWING = gql`
  query GetMyFollowing($limit: Int, $skip: Int) {
    myFollowing(limit: $limit, skip: $skip) {
      ...UserFragment
    }
  }
  ${USER_FRAGMENT}
`;

export const GET_USER_FOLLOWERS = gql`
  query GetUserFollowers($userId: ID!, $limit: Int, $skip: Int) {
    userFollowers(userId: $userId, limit: $limit, skip: $skip) {
      ...UserFragment
    }
  }
  ${USER_FRAGMENT}
`;

export const GET_USER_FOLLOWING = gql`
  query GetUserFollowing($userId: ID!, $limit: Int, $skip: Int) {
    userFollowing(userId: $userId, limit: $limit, skip: $skip) {
      ...UserFragment
    }
  }
  ${USER_FRAGMENT}
`;

export const CHECK_IS_FOLLOWING = gql`
  query CheckIsFollowing($userId: ID!) {
    isFollowing(userId: $userId)
  }
`;

// Mutations
export const FOLLOW_USER = gql`
  mutation FollowUser($input: FollowUserInput!) {
    followUser(followUserInput: $input) {
      success
      message
    }
  }
`;

export const UNFOLLOW_USER = gql`
  mutation UnfollowUser($input: UnfollowUserInput!) {
    unfollowUser(unFollowUserInput: $input) {
      success
      message
    }
  }
`;
