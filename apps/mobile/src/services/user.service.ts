import {gql} from '@apollo/client';
import {apolloClient} from '../configs/apolloClientConfig';
import {User} from '../types';
import {loggingService} from './logging.service';

// GraphQL Fragments
const USER_FRAGMENT = gql`
  fragment UserFields on User {
    id
    firstName
    lastName
    avatar
  }
`;

// GraphQL Queries
const GET_MY_FOLLOWERS = gql`
  query GetMyFollowers {
    myFollowers {
      ...UserFields
    }
  }
  ${USER_FRAGMENT}
`;

const GET_MY_FOLLOWING = gql`
  query GetMyFollowing {
    myFollowing {
      ...UserFields
    }
  }
  ${USER_FRAGMENT}
`;

const GET_USER_FOLLOWERS = gql`
  query GetUserFollowers($userId: String!) {
    userFollowers(userId: $userId) {
      ...UserFields
    }
  }
  ${USER_FRAGMENT}
`;

const GET_USER_FOLLOWING = gql`
  query GetUserFollowing($userId: String!) {
    userFollowing(userId: $userId) {
      ...UserFields
    }
  }
  ${USER_FRAGMENT}
`;

const CHECK_IS_FOLLOWING = gql`
  query CheckIsFollowing($userId: String!) {
    isFollowing(userId: $userId)
  }
`;

// GraphQL Mutations
const FOLLOW_USER = gql`
  mutation FollowUser($input: FollowUserInput!) {
    followUser(input: $input) {
      id
    }
  }
`;

const UNFOLLOW_USER = gql`
  mutation UnfollowUser($input: FollowUserInput!) {
    unfollowUser(input: $input)
  }
`;

export const userService = {
  // Get current user's followers
  async getMyFollowers(): Promise<User[]> {
    try {
      const {data} = await apolloClient.query({
        query: GET_MY_FOLLOWERS,
        fetchPolicy: 'network-only',
      });
      return data.myFollowers;
    } catch (error) {
      loggingService.error('Error getting my followers:', error);
      return [];
    }
  },

  // Get users the current user follows
  async getMyFollowing(): Promise<User[]> {
    try {
      const {data} = await apolloClient.query({
        query: GET_MY_FOLLOWING,
        fetchPolicy: 'network-only',
      });
      return data.myFollowing;
    } catch (error) {
      loggingService.error('Error getting my following:', error);
      return [];
    }
  },

  // Get a specific user's followers
  async getUserFollowers(userId: string): Promise<User[]> {
    try {
      const {data} = await apolloClient.query({
        query: GET_USER_FOLLOWERS,
        variables: {userId},
        fetchPolicy: 'network-only',
      });
      return data.userFollowers;
    } catch (error) {
      loggingService.error('Error getting user followers:', error);
      return [];
    }
  },

  // Get users that a specific user follows
  async getUserFollowing(userId: string): Promise<User[]> {
    try {
      const {data} = await apolloClient.query({
        query: GET_USER_FOLLOWING,
        variables: {userId},
        fetchPolicy: 'network-only',
      });
      return data.userFollowing;
    } catch (error) {
      loggingService.error('Error getting user following:', error);
      return [];
    }
  },

  // Check if current user is following another user
  async isFollowing(userId: string): Promise<boolean> {
    try {
      const {data} = await apolloClient.query({
        query: CHECK_IS_FOLLOWING,
        variables: {userId},
        fetchPolicy: 'network-only',
      });
      return data.isFollowing;
    } catch (error) {
      loggingService.error('Error checking if following:', error);
      return false;
    }
  },

  // Follow a user
  async followUser(userId: string): Promise<void> {
    try {
      await apolloClient.mutate({
        mutation: FOLLOW_USER,
        variables: {
          input: {userId},
        },
        refetchQueries: [
          {query: GET_MY_FOLLOWING},
          {
            query: CHECK_IS_FOLLOWING,
            variables: {userId},
          },
        ],
      });
    } catch (error) {
      loggingService.error('Error following user:', error);
    }
  },

  // Unfollow a user
  async unfollowUser(userId: string): Promise<void> {
    try {
      await apolloClient.mutate({
        mutation: UNFOLLOW_USER,
        variables: {
          input: {userId},
        },
        refetchQueries: [
          {query: GET_MY_FOLLOWING},
          {
            query: CHECK_IS_FOLLOWING,
            variables: {userId},
          },
        ],
      });
    } catch (error) {
      loggingService.error('Error unfollowing user:', error);
    }
  },
};
