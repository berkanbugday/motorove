import {useLazyQuery} from '@apollo/client';
import {IUser} from '@motorove/shared/interfaces';
import {loggingService} from './logging.service';
import {SEARCH_USERS} from './graphql/user.graphql';
import {useCallback, useEffect, useState} from 'react';
import {apolloClient} from '../configs/apolloClientConfig';
import {GET_MY_FOLLOWING} from './graphql/follow.graphql';

/**
 * Hook for searching users by name or email with pagination
 * @param initialQuery Optional initial search query
 * @returns Users data, loading state, error state and functions for search operations
 */
export const useSearchUsers = (initialQuery = '') => {
  const [users, setUsers] = useState<IUser[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [skip, setSkip] = useState<number>(0);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>(initialQuery);

  const [searchUsersQuery] = useLazyQuery(SEARCH_USERS, {
    fetchPolicy: 'network-only',
    onError: errorObj => {
      loggingService.error('Error searching users:', errorObj);
      setError(errorObj);
      setLoading(false);
    },
  });

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

        const {data} = await searchUsersQuery({
          variables: {
            input: {
              query,
              limit: 20,
              skip: skipValue,
            },
          },
          fetchPolicy: 'network-only',
        });

        if (data?.searchUsers) {
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
    [searchUsersQuery],
  );

  // Effect to handle initial query if provided
  useEffect(() => {
    if (initialQuery) {
      fetchUsers(initialQuery);
    }
  }, [initialQuery, fetchUsers]);

  const search = useCallback(
    (query: string) => {
      setSearchQuery(query);
      setSkip(0); // Reset pagination
      fetchUsers(query, 0, false);
    },
    [fetchUsers],
  );

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      fetchUsers(searchQuery, skip, true);
    }
  }, [loading, hasMore, fetchUsers, searchQuery, skip]);

  const clearSearch = useCallback(() => {
    setUsers([]);
    setSearchQuery('');
    setSkip(0);
    setHasMore(true);
  }, []);

  return {
    users,
    loading,
    error,
    hasMore,
    search,
    loadMore,
    clearSearch,
    searchQuery,
  };
};

/**
 * Hook for getting users that the current user is following with pagination
 * @returns Following users data, loading state, error state and functions for pagination
 */
export const useMyFollowing = () => {
  const [users, setUsers] = useState<IUser[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [skip, setSkip] = useState<number>(0);
  const [hasMore, setHasMore] = useState<boolean>(true);

  const [getFollowingQuery] = useLazyQuery(GET_MY_FOLLOWING, {
    fetchPolicy: 'network-only',
    onError: errorObj => {
      loggingService.error('Error fetching following:', errorObj);
      setError(errorObj);
      setLoading(false);
    },
  });

  const fetchFollowing = useCallback(
    async (skipValue = 0, append = false) => {
      try {
        setLoading(true);
        setError(null);

        const {data} = await getFollowingQuery({
          variables: {
            limit: 20,
            skip: skipValue,
          },
          fetchPolicy: 'network-only',
        });

        if (data?.myFollowing) {
          if (append) {
            setUsers(prevUsers => [...prevUsers, ...data.myFollowing]);
          } else {
            setUsers(data.myFollowing);
          }
          setHasMore(data.myFollowing.length === 20);
          setSkip(skipValue + data.myFollowing.length);
        }
      } catch (e) {
        loggingService.error('Error fetching following users:', e);
        setError(e as Error);
      } finally {
        setLoading(false);
      }
    },
    [getFollowingQuery],
  );

  // Effect to fetch data on mount
  useEffect(() => {
    fetchFollowing(0, false);
  }, [fetchFollowing]);

  const refresh = useCallback(() => {
    setSkip(0); // Reset pagination
    fetchFollowing(0, false);
  }, [fetchFollowing]);

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      // Load additional users with real-time data
      fetchFollowing(skip, true);
    }
  }, [loading, hasMore, fetchFollowing, skip]);

  return {
    users,
    loading,
    error,
    hasMore,
    refresh,
    loadMore,
  };
};

/**
 * User service for handling user-related operations
 */
export const userService = {
  /**
   * Search for users by name or email
   * @param query Search query
   * @param limit Maximum number of results to return
   * @param skip Number of results to skip (for pagination)
   * @returns Array of matching users
   */
  async searchUsers(query: string, limit = 20, skip = 0): Promise<IUser[]> {
    try {
      const {data} = await apolloClient.query({
        query: SEARCH_USERS,
        variables: {
          input: {
            query,
            limit,
            skip,
          },
        },
        fetchPolicy: 'network-only',
      });
      return data.searchUsers || [];
    } catch (error) {
      loggingService.error('Error in searchUsers:', error);
      throw error;
    }
  },

  /**
   * Get users that the current user is following
   * @param limit Maximum number of results to return
   * @param skip Number of results to skip (for pagination)
   * @returns Array of users the current user follows
   */
  async getMyFollowing(limit = 20, skip = 0): Promise<IUser[]> {
    try {
      const {data} = await apolloClient.query({
        query: GET_MY_FOLLOWING,
        variables: {
          limit,
          skip,
        },
        fetchPolicy: 'network-only',
      });
      return data.myFollowing || [];
    } catch (error) {
      loggingService.error('Error in getMyFollowing:', error);
      throw error;
    }
  },
};

/**
 * Export as UserService object
 */
export const UserService = {
  useSearchUsers,
  useMyFollowing,
};

export default UserService;
