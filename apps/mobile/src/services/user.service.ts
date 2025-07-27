import {useLazyQuery, useMutation} from '@apollo/client';
import {IAccountSetup, IUser} from '@motorove/shared/interfaces';
import {loggingService} from './logging.service';
import {SEARCH_USERS, ACCOUNT_SETUP} from './graphql/user.graphql';
import {useCallback, useEffect, useState} from 'react';
import {apolloClient} from '../configs/apolloClientConfig';
import {showToast} from '@components';
import {useTranslation} from '@hooks/useTranslation';

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
            query,
            limit: 20,
            skip: skipValue,
          },
          fetchPolicy: 'network-only',
        });

        if (data?.users) {
          if (append) {
            setUsers(prevUsers => [...prevUsers, ...data.users]);
          } else {
            setUsers(data.users);
          }
          setHasMore(data.users.length === 20);
          setSkip(skipValue + data.users.length);
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
  useAccountSetup,
};

export default UserService;
