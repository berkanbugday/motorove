import {useMutation, useQuery} from '@apollo/client';
import {
  GET_PENDING_FOLLOW_REQUESTS,
  FOLLOW_USER,
  UNFOLLOW_USER,
  UPDATE_INVITATION_STATUS,
} from './graphql/user-following.graphql';
import {loggingService} from './logging.service';
import {showToast} from '@components';
import {InvitationStatus, IUserFollowing} from '@motorove/shared';
import {useTranslation} from '@hooks/useTranslation';
import {useCallback, useState} from 'react';

/**
 * Hook for getting pending follow requests
 * @param limit Optional number of pending follow requests to fetch (for pagination)
 * @param skip Optional number of pending follow requests to skip (for pagination)
 * @returns The pending follow requests list, loading state, error state, and refetch function
 */
export const usePendingFollowRequests = (limit?: number, skip?: number) => {
  const {t} = useTranslation();
  const [hasMore, setHasMore] = useState(true);

  const {
    data,
    loading,
    error,
    refetch: originalRefetch,
    fetchMore,
  } = useQuery(GET_PENDING_FOLLOW_REQUESTS, {
    variables: {
      limit: limit || undefined,
      skip: skip || undefined,
    },
    fetchPolicy: 'network-only',
    nextFetchPolicy: 'network-only',
    onCompleted: () => {
      if (data?.pendingFollowRequests) {
        if (data.pendingFollowRequests.length < (limit || 0)) {
          setHasMore(false);
        }
      }
    },
    onError: errorObj => {
      loggingService.error('Error fetching pending follow requests:', errorObj);
    },
  });

  const [updateStatus, {loading: updateLoading}] = useMutation(
    UPDATE_INVITATION_STATUS,
    {
      onCompleted: _data => {
        // Refetch the pending follow requests
        originalRefetch();

        if (
          _data.updateUserFollowingInvitationStatus.status ===
          InvitationStatus.ACCEPTED
        ) {
          showToast({
            type: 'success',
            text1: t('common.success'),
            text2: t('screens.followRequest.request_accepted'),
          });
        } else {
          showToast({
            type: 'success',
            text1: t('common.success'),
            text2: t('screens.followRequest.request_rejected'),
          });
        }
      },
      onError: errorObj => {
        loggingService.error('Error updating invitation status:', errorObj);
        showToast({
          type: 'error',
          text1: t('common.error'),
          text2: errorObj.message || t('errors.general.something_wrong'),
        });
      },
    },
  );

  // Wrap the original refetch to reset hasMore state
  const refetch = useCallback(async () => {
    setHasMore(true);
    return await originalRefetch();
  }, [originalRefetch]);

  const loadMore = useCallback(async () => {
    if (!hasMore || loading) {
      return;
    }

    try {
      const result = await fetchMore({
        variables: {
          skip: data?.pendingFollowRequests?.length || 0,
          limit,
        },
        updateQuery: (prev, {fetchMoreResult}) => {
          if (!fetchMoreResult) {
            return prev;
          }

          return {
            pendingFollowRequests: [
              ...prev.pendingFollowRequests,
              ...fetchMoreResult.pendingFollowRequests,
            ],
          };
        },
      });

      if (result.data.pendingFollowRequests.length < (limit || 0)) {
        setHasMore(false);
      }
    } catch (errorObj) {
      loggingService.error(
        'Error loading more pending follow requests:',
        errorObj,
      );
    }
  }, [fetchMore, hasMore, limit, loading]);

  // Handle accept request
  const handleAccept = useCallback(
    async (id: string) => {
      try {
        await updateStatus({
          variables: {
            input: {
              id,
              status: InvitationStatus.ACCEPTED,
            },
          },
        });
      } catch (err) {
        loggingService.error('Error accepting pending follow request:', err);
      }
    },
    [updateStatus, t],
  );

  // Handle reject request
  const handleReject = useCallback(
    async (id: string) => {
      try {
        await updateStatus({
          variables: {
            input: {
              id,
              status: InvitationStatus.REJECTED,
            },
          },
        });
      } catch (err) {
        loggingService.error('Error rejecting pending follow request:', err);
      }
    },
    [updateStatus, t],
  );

  return {
    pendingFollowRequests:
      (data?.pendingFollowRequests as IUserFollowing[]) || [],
    loading: loading || updateLoading,
    error,
    refetch,
    loadMore,
    hasMore,
    handleAccept,
    handleReject,
  };
};

/**
 * Hook for following a user
 * @param onSuccess Optional callback function to execute on successful follow
 * @returns A function to follow a user and loading state
 */
export const useFollowUser = (onSuccess?: () => void) => {
  const [followUserMutation, {loading}] = useMutation(FOLLOW_USER, {
    onCompleted: _data => {
      if (onSuccess) {
        onSuccess();
      }
    },
    onError: errorObj => {
      loggingService.error('Error following user:', errorObj);
      showToast({
        type: 'error',
        text1: 'Error',
        text2: errorObj.message || 'Failed to follow user. Please try again.',
      });
    },
  });

  const followUser = async (userId: string) => {
    try {
      const result = await followUserMutation({
        variables: {userId},
      });
      return result.data?.followUser;
    } catch (err) {
      loggingService.error('Error in followUser:', err);
      return null;
    }
  };

  return {
    followUser,
    loading,
  };
};

/**
 * Hook for unfollowing a user
 * @param onSuccess Optional callback function to execute on successful unfollow
 * @returns A function to unfollow a user and loading state
 */
export const useUnfollowUser = (onSuccess?: () => void) => {
  const [unfollowUserMutation, {loading}] = useMutation(UNFOLLOW_USER, {
    onCompleted: _data => {
      if (onSuccess) {
        onSuccess();
      }
    },
    onError: errorObj => {
      loggingService.error('Error unfollowing user:', errorObj);
      showToast({
        type: 'error',
        text1: 'Error',
        text2: errorObj.message || 'Failed to unfollow user. Please try again.',
      });
    },
  });

  const unfollowUser = async (userId: string) => {
    try {
      const result = await unfollowUserMutation({
        variables: {userId},
      });
      return result.data?.unfollow;
    } catch (err) {
      loggingService.error('Error in unfollowUser:', err);
      return null;
    }
  };

  return {
    unfollowUser,
    loading,
  };
};

/**
 * Export as FollowService object
 */
export const FollowService = {
  // useMyFollowers,
  // useMyFollowing,
  // useUserFollowers,
  // useUserFollowing,
  // useCheckIsFollowing,
  useFollowUser,
  useUnfollowUser,
};

export default FollowService;
