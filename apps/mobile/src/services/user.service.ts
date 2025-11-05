import {useQuery, useMutation} from '@apollo/client';
import {
  IAccountSetup,
  IUser,
  IUpdateUser,
  IProfile,
  IUserStats,
} from '@motorove/shared';
import {loggingService} from './logging.service';
import {
  SEARCH_USERS,
  ACCOUNT_SETUP,
  GET_USER_PROFILE,
  GET_USER_STATS,
  UPDATE_USER_PROFILE,
} from './graphql/user.graphql';
import {useCallback, useEffect, useState, useRef} from 'react';
import {apolloClient} from '../configs/apolloClientConfig';
import {showToast} from '@components';
import {useTranslation} from '@hooks/useTranslation';

/**
 * Hook for searching users by name or email with pagination
 * @param query Search query
 * @returns Users data, loading state, error state and functions for search operations
 */
export const useSearchUsers = (query = '') => {
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const loadMoreAbortControllerRef = useRef<AbortController | null>(null);
  const currentQueryRef = useRef<string>(query);

  const {
    data,
    loading,
    error,
    refetch: originalRefetch,
    fetchMore,
  } = useQuery(SEARCH_USERS, {
    variables: {
      query: query || undefined,
      limit: 20,
      skip: 0,
    },
    fetchPolicy: 'network-only',
    onError: errorObj => {
      loggingService.error('Error searching users:', errorObj);
    },
  });

  // Cancel ongoing requests when query changes
  useEffect(() => {
    if (currentQueryRef.current !== query) {
      // Cancel any ongoing loadMore request
      if (loadMoreAbortControllerRef.current) {
        loadMoreAbortControllerRef.current.abort();
        loadMoreAbortControllerRef.current = null;
        setIsFetchingMore(false);
      }

      currentQueryRef.current = query;
    }
  }, [query]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (loadMoreAbortControllerRef.current) {
        loadMoreAbortControllerRef.current.abort();
      }
    };
  }, []);

  // Wrap the original refetch to reset state and cancel ongoing requests
  const refetch = useCallback(async () => {
    // Cancel any ongoing loadMore request
    if (loadMoreAbortControllerRef.current) {
      loadMoreAbortControllerRef.current.abort();
      loadMoreAbortControllerRef.current = null;
    }
    setIsFetchingMore(false);

    return await originalRefetch();
  }, [originalRefetch]);

  const search = useCallback(
    async (searchQuery: string) => {
      // Cancel any ongoing loadMore request
      if (loadMoreAbortControllerRef.current) {
        loadMoreAbortControllerRef.current.abort();
        loadMoreAbortControllerRef.current = null;
      }
      setIsFetchingMore(false);

      return await originalRefetch({
        query: searchQuery || undefined,
        limit: 20,
        skip: 0,
      });
    },
    [originalRefetch],
  );

  const loadMore = useCallback(async () => {
    // Prevent multiple concurrent loadMore requests
    if (isFetchingMore || loading) {
      return;
    }

    // Check if query has changed since this callback was created
    if (currentQueryRef.current !== query) {
      return;
    }

    // Cancel any existing loadMore request
    if (loadMoreAbortControllerRef.current) {
      loadMoreAbortControllerRef.current.abort();
    }

    // Create new abort controller for this request
    loadMoreAbortControllerRef.current = new AbortController();
    const currentAbortController = loadMoreAbortControllerRef.current;

    setIsFetchingMore(true);

    try {
      await fetchMore({
        variables: {
          skip: data?.users?.length || 0,
          limit: 20,
          query: query || undefined,
        },
        updateQuery: (prev, {fetchMoreResult}) => {
          // Check if this request was aborted
          if (currentAbortController.signal.aborted) {
            return prev;
          }

          // Check if query has changed during the request
          if (currentQueryRef.current !== query) {
            return prev;
          }

          if (!fetchMoreResult || !fetchMoreResult.users) {
            return prev;
          }

          const prevUsers = prev?.users || [];
          // Create a Set of existing user IDs to prevent duplicates
          const existingIds = new Set(prevUsers.map((user: any) => user.id));

          // Filter out any users that already exist
          const newUsers = fetchMoreResult.users.filter(
            (user: any) => !existingIds.has(user.id),
          );

          return {
            users: [...prevUsers, ...newUsers],
          };
        },
      });
    } catch (errorObj: any) {
      setIsFetchingMore(false);
      // Don't log errors for aborted requests
      if (
        errorObj.name !== 'AbortError' &&
        !currentAbortController.signal.aborted
      ) {
        loggingService.error('Error loading more users:', errorObj);
      }
    } finally {
      // Only reset loading state if this is still the current request
      if (loadMoreAbortControllerRef.current === currentAbortController) {
        setIsFetchingMore(false);
        loadMoreAbortControllerRef.current = null;
      }
    }
  }, [data?.users?.length, fetchMore, isFetchingMore, loading, query]);

  return {
    users: data?.users || [],
    loading,
    error,
    isFetchingMore,
    search,
    loadMore,
    refetch,
  };
};

/**
 * Hook for fetching user profile data
 * @param userId User ID to fetch profile for
 * @returns User profile data, loading state, error state
 */
export const useGetUserProfile = (userId: string) => {
  const {data, loading, error, refetch} = useQuery(GET_USER_PROFILE, {
    variables: {id: userId},
    skip: !userId,
    fetchPolicy: 'cache-and-network',
    onError: errorObj => {
      loggingService.error('Error fetching user profile:', errorObj);
    },
  });

  return {
    profile: data?.userProfile as IProfile,
    loading,
    error,
    refetch,
  };
};

/**
 * Hook for fetching user statistics (posts, events, followers, following counts)
 * @param userId User ID to fetch stats for
 * @returns User stats, loading state, error state
 */
export const useGetUserStats = (userId: string) => {
  const {data, loading, error, refetch} = useQuery(GET_USER_STATS, {
    variables: {userId},
    skip: !userId,
    fetchPolicy: 'cache-and-network',
    onError: errorObj => {
      loggingService.error('Error fetching user stats:', errorObj);
    },
  });

  return {
    stats: data?.userStats as IUserStats,
    loading,
    error,
    refetch,
  };
};

export const useAccountSetup = (onSuccess?: () => void) => {
  const {t} = useTranslation();
  const [accountSetupMutation, {loading, error}] = useMutation(ACCOUNT_SETUP, {
    onCompleted: _data => {
      showToast({
        type: 'success',
        text1: t('common.success'),
        text2: t('screens.accountSetup.success_completed_account_setup'),
      });
      if (onSuccess) {
        onSuccess();
      }
    },
    onError: errorObj => {
      loggingService.error('Error during account setup:', errorObj);
      showToast({
        type: 'error',
        text1: t('common.error'),
        text2: errorObj.message || t('screens.accountSetup.setup_failed'),
      });
    },
  });

  const accountSetup = async (input: IAccountSetup) => {
    try {
      const result = await accountSetupMutation({
        variables: {
          input,
        },
      });
      return result.data?.accountSetup;
    } catch (err) {
      loggingService.error('Error in accountSetup:', err);
      return null;
    }
  };

  return {
    accountSetup,
    loading,
    error,
  };
};

/**
 * Hook for updating user profile
 * @param onSuccess Optional callback to execute on successful update
 * @returns Update function, loading state, and error state
 */
export const useUpdateUserProfile = (onSuccess?: () => void) => {
  const {t} = useTranslation();
  const [updateUserProfileMutation, {loading, error}] = useMutation(
    UPDATE_USER_PROFILE,
    {
      onCompleted: _data => {
        showToast({
          type: 'success',
          text1: t('common.success'),
          text2: t('screens.editProfile.profile_updated'),
        });

        if (onSuccess) {
          onSuccess();
        }
      },
      onError: errorObj => {
        loggingService.error('Error updating user profile:', errorObj);
        showToast({
          type: 'error',
          text1: t('common.error'),
          text2:
            errorObj.message || t('screens.editProfile.profile_updated_failed'),
        });
      },
    },
  );

  const updateUserProfile = async (input: IUpdateUser) => {
    try {
      const result = await updateUserProfileMutation({
        variables: {input},
      });
      return result.data?.updateUserProfile;
    } catch (err) {
      loggingService.error('Error in updateUserProfile:', err);
      // Error is already handled in onError callback
      return null;
    }
  };

  return {
    updateUserProfile,
    loading,
    error,
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
};

/**
 * Export as UserService object
 */
export const UserService = {
  useSearchUsers,
  useGetUserProfile,
  useGetUserStats,
  useAccountSetup,
  useUpdateUserProfile,
};

export default UserService;
