import {useMutation, useQuery} from '@apollo/client';
import {
  BLOCK_USER,
  UNBLOCK_USER,
  GET_BLOCKED_USERS,
  IS_USER_BLOCKED,
} from './graphql/user-block.graphql';
import {loggingService} from './logging.service';
import {showToast} from '@components';
import {useCallback} from 'react';
import useTranslation from '@hooks/useTranslation';
import {IUserBlock} from '@motorove/shared';

// Hook for blocking a user
export const useBlockUser = (onSuccess?: () => void) => {
  const {t} = useTranslation();
  const [blockUserMutation, {loading, error}] = useMutation(BLOCK_USER, {
    onCompleted: () => {
      showToast({
        type: 'success',
        text1: t('common.success'),
        text2: t('screens.profile.blocked_successfully'),
      });

      if (onSuccess) {
        onSuccess();
      }
    },
    onError: errorObj => {
      loggingService.error('Error blocking user:', errorObj);
      showToast({
        type: 'error',
        text1: t('common.error'),
        text2: errorObj.message || t('screens.profile.blocked_failed'),
      });
    },
  });

  const blockUser = useCallback(
    async (blockedUserId: string) => {
      try {
        const result = await blockUserMutation({
          variables: {blockedUserId},
        });
        return result.data?.blockUser;
      } catch (err) {
        loggingService.error('Error in blockUser:', err);
        return null;
      }
    },
    [blockUserMutation],
  );

  return {
    blockUser,
    loading,
    error,
  };
};

// Hook for unblocking a user
export const useUnblockUser = (onSuccess?: () => void) => {
  const {t} = useTranslation();
  const [unblockUserMutation, {loading, error}] = useMutation(UNBLOCK_USER, {
    onCompleted: () => {
      showToast({
        type: 'success',
        text1: t('common.success'),
        text2: t('screens.blockedUser.unblocked_successfully'),
      });

      if (onSuccess) {
        onSuccess();
      }
    },
    onError: errorObj => {
      loggingService.error('Error unblocking user:', errorObj);
      showToast({
        type: 'error',
        text1: t('common.error'),
        text2: errorObj.message || t('screens.blockedUser.unblocked_failed'),
      });
    },
  });

  const unblockUser = useCallback(
    async (blockedUserId: string) => {
      try {
        const result = await unblockUserMutation({
          variables: {blockedUserId},
        });
        return result.data?.unblockUser;
      } catch (err) {
        loggingService.error('Error in unblockUser:', err);
        return null;
      }
    },
    [unblockUserMutation],
  );

  return {
    unblockUser,
    loading,
    error,
  };
};

/**
 * Hook for getting blocked users
 * @returns The blocked users list, loading state, error state, and helper functions
 */
export const useGetBlockedUsers = () => {
  const {t} = useTranslation();

  const {
    data,
    loading,
    error,
    refetch: originalRefetch,
  } = useQuery(GET_BLOCKED_USERS, {
    fetchPolicy: 'network-only',
    nextFetchPolicy: 'network-only',
    onError: errorObj => {
      loggingService.error('Error fetching blocked users:', errorObj);
    },
  });

  const [unblockMutation, {loading: unblockLoading}] = useMutation(
    UNBLOCK_USER,
    {
      onCompleted: () => {
        // Refetch the blocked users
        originalRefetch();
        showToast({
          type: 'success',
          text1: t('common.success'),
          text2: t('screens.blockedUser.unblocked_successfully'),
        });
      },
      onError: errorObj => {
        loggingService.error('Error unblocking user:', errorObj);
        showToast({
          type: 'error',
          text1: t('common.error'),
          text2: errorObj.message || t('screens.blockedUser.unblocked_failed'),
        });
      },
    },
  );

  // Wrap the original refetch
  const refetch = useCallback(async () => {
    return await originalRefetch();
  }, [originalRefetch]);

  // Handle unblock user
  const handleUnblock = useCallback(
    async (blockedUserId: string) => {
      try {
        await unblockMutation({
          variables: {blockedUserId},
        });
      } catch (err) {
        loggingService.error('Error unblocking user:', err);
      }
    },
    [unblockMutation],
  );

  return {
    blockedUsers: (data?.blockedUsers as IUserBlock[]) || [],
    loading: loading || unblockLoading,
    error,
    refetch,
    handleUnblock,
  };
};

/**
 * Hook for checking if a user is blocked using the backend isUserBlocked method
 * @param userId - The user ID to check if blocked
 * @param skip - Whether to skip the query
 * @returns The blocked status, loading state, error state, and refetch function
 */
export const useIsUserBlocked = (
  userId: string | null | undefined,
  skip?: boolean,
) => {
  const {
    data,
    loading,
    error,
    refetch: originalRefetch,
  } = useQuery(IS_USER_BLOCKED, {
    variables: {userId},
    skip: skip || !userId,
    fetchPolicy: 'network-only',
    nextFetchPolicy: 'cache-first',
    onError: errorObj => {
      loggingService.error('Error checking if user is blocked:', errorObj);
    },
  });

  const refetch = useCallback(async () => {
    if (!userId) {
      return null;
    }
    return await originalRefetch();
  }, [originalRefetch, userId]);

  return {
    isUserBlocked: data?.isUserBlocked ?? false,
    loading,
    error,
    refetch,
  };
};
