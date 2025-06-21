import {gql} from '@apollo/client';
import {apolloClient} from '../configs/apolloClientConfig';
import {User} from '../types';
import {loggingService} from './logging.service';
import {useState, useCallback, useEffect} from 'react';

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

const SEARCH_USERS = gql`
  query SearchUsers($query: String!, $limit: Int, $skip: Int) {
    searchUsers(query: $query, limit: $limit, skip: $skip) {
      ...UserFields
    }
  }
  ${USER_FRAGMENT}
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

// Custom hook for searching users
export const useSearchUsers = (initialQuery = '') => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [skip, setSkip] = useState<number>(0);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>(initialQuery);

  const fetchUsers = useCallback(
    async (query: string, skipValue = 0, append = false) => {
      try {
        setLoading(true);
        setError(null);

        // Only search if there's a query
        if (query.trim() === '') {
          setUsers([]);
          setHasMore(false);
          setLoading(false);
          return;
        }

        const {data} = await apolloClient.query({
          query: SEARCH_USERS,
          variables: {
            query,
            limit: 20,
            skip: skipValue,
          },
          fetchPolicy: 'network-only',
        });

        if (data.searchUsers) {
          if (append) {
            setUsers(prevUsers => [...prevUsers, ...data.searchUsers]);
          } else {
            setUsers(data.searchUsers);
          }
          setHasMore(data.searchUsers.length === 20);
          setSkip(skipValue + data.searchUsers.length);
        }
      } catch (e) {
        loggingService.error('Error searching users:', e);
        setError(e as Error);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    if (searchQuery) {
      fetchUsers(searchQuery);
    }
  }, [searchQuery, fetchUsers]);

  const loadMore = useCallback(() => {
    if (hasMore && !loading && searchQuery) {
      fetchUsers(searchQuery, skip, true);
    }
  }, [fetchUsers, hasMore, loading, searchQuery, skip]);

  const refetch = useCallback(() => {
    setSkip(0);
    return fetchUsers(searchQuery);
  }, [fetchUsers, searchQuery]);

  return {
    users,
    loading,
    error,
    searchQuery,
    setSearchQuery,
    refetch,
    loadMore,
    hasMore,
  };
};

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

  // Search for users
  async searchUsers(query: string, limit = 20, skip = 0): Promise<User[]> {
    try {
      const {data} = await apolloClient.query({
        query: SEARCH_USERS,
        variables: {query, limit, skip},
        fetchPolicy: 'network-only',
      });
      return data.searchUsers;
    } catch (error) {
      loggingService.error('Error searching users:', error);
      return [];
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
