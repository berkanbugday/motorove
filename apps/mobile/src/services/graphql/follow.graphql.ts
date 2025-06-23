import {gql} from '@apollo/client';
import {USER_FRAGMENT} from './user.graphql';

// Fragment
export const FOLLOW_USER_FRAGMENT = gql`
  fragment FollowUserFragment on Follow {
    following {
      ...UserFragment
    }
    follower {
      ...UserFragment
    }
  }
  ${USER_FRAGMENT}
`;

export const UNFOLLOW_USER_FRAGMENT = gql`
  fragment UnfollowUserFragment on Unfollow {
    id
    following {
      ...UserFragment
    }
  }
  ${USER_FRAGMENT}
`;

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
  query GetUserFollowers($userId: String!, $limit: Int, $skip: Int) {
    userFollowers(userId: $userId, limit: $limit, skip: $skip) {
      ...UserFragment
    }
  }
  ${USER_FRAGMENT}
`;

export const GET_USER_FOLLOWING = gql`
  query GetUserFollowing($userId: String!, $limit: Int, $skip: Int) {
    userFollowing(userId: $userId, limit: $limit, skip: $skip) {
      ...UserFragment
    }
  }
  ${USER_FRAGMENT}
`;

export const CHECK_IS_FOLLOWING = gql`
  query CheckIsFollowing($userId: String!) {
    isFollowing(userId: $userId)
  }
`;

// Mutations
export const FOLLOW_USER = gql`
  mutation FollowUser($input: FollowUserInput!) {
    followUser(followUserInput: $input) {
      ...FollowUserFragment
    }
  }
  ${FOLLOW_USER_FRAGMENT}
`;

export const UNFOLLOW_USER = gql`
  mutation UnfollowUser($input: UnfollowUserInput!) {
    unfollowUser(unFollowUserInput: $input) {
      ...UnfollowUserFragment
    }
  }
  ${UNFOLLOW_USER_FRAGMENT}
`;
