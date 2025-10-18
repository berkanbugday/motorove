import {useMutation, useQuery} from '@apollo/client';
import {
  GET_FOLLOW_REQUESTS,
  GET_FOLLOWING_USERS,
  GET_FOLLOWER_USERS,
  FOLLOW_USER,
  UNFOLLOW_USER,
  UPDATE_USER_FOLLOWING_APPROVAL_STATUS,
} from './graphql/user-following.graphql';
import {loggingService} from './logging.service';
import {showToast} from '@components';
import {ApprovalStatus, IUserFollowing} from '@motorove/shared';
import {useTranslation} from '@hooks/useTranslation';
import {useCallback, useState} from 'react';

/**
 * Hook for getting follow requests
 * @param limit Optional number of follow requests to fetch (for pagination)
 * @param skip Optional number of follow requests to skip (for pagination)
 * @returns The follow requests list, loading state, error state, and refetch function
 */
export const useFollowRequests = (limit?: number, skip?: number) => {
  const {t} = useTranslation();
  const [hasMore, setHasMore] = useState(true);

  const {
    data,
    loading,
    error,
    refetch: originalRefetch,
    fetchMore,
  } = useQuery(GET_FOLLOW_REQUESTS, {
    variables: {
      limit: limit || undefined,
      skip: skip || undefined,
    },
    fetchPolicy: 'network-only',
    nextFetchPolicy: 'network-only',
    onCompleted: () => {
      if (data?.followRequests) {
        if (data.followRequests.length < (limit || 0)) {
          setHasMore(false);
        }
      }
    },
    onError: errorObj => {
      loggingService.error('Error fetching follow requests:', errorObj);
    },
  });

  const [updateStatus, {loading: updateLoading}] = useMutation(
    UPDATE_USER_FOLLOWING_APPROVAL_STATUS,
    {
      onCompleted: _data => {
        // Refetch the follow requests
        originalRefetch();

        if (
          _data.updateUserFollowingApprovalStatus.status ===
          ApprovalStatus.ACCEPTED
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
        loggingService.error('Error updating approval status:', errorObj);
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
          skip: data?.followRequests?.length || 0,
          limit,
        },
        updateQuery: (prev, {fetchMoreResult}) => {
          if (!fetchMoreResult) {
            return prev;
          }

          const prevRequests = prev?.followRequests || [];
          // Create a Set of existing request IDs to prevent duplicates
          const existingIds = new Set(
            prevRequests.map((request: any) => request.id),
          );

          // Filter out any requests that already exist
          const newRequests = fetchMoreResult.followRequests.filter(
            (request: any) => !existingIds.has(request.id),
          );

          return {
            followRequests: [...prevRequests, ...newRequests],
          };
        },
      });

      if (result.data.followRequests.length < (limit || 0)) {
        setHasMore(false);
      }
    } catch (errorObj) {
      loggingService.error('Error loading more follow requests:', errorObj);
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
              status: ApprovalStatus.ACCEPTED,
            },
          },
        });
      } catch (err) {
        loggingService.error('Error accepting follow request:', err);
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
              status: ApprovalStatus.REJECTED,
            },
          },
        });
      } catch (err) {
        loggingService.error('Error rejecting follow request:', err);
      }
    },
    [updateStatus, t],
  );

  return {
    followRequests: (data?.followRequests as IUserFollowing[]) || [],
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
 * Hook for getting users that the current user or specified user is following
 * @param userId Optional ID of the user to get following for (if not provided, gets current user's following)
 * @param limit Optional number of following users to fetch (for pagination)
 * @param skip Optional number of following users to skip (for pagination)
 * @returns The following users list, loading state, error state, and helper functions
 */
export const useFollowingUsers = (
  userId?: string,
  limit?: number,
  skip?: number,
) => {
  const [hasMore, setHasMore] = useState(true);

  const {
    data,
    loading,
    error,
    refetch: originalRefetch,
    fetchMore,
  } = useQuery(GET_FOLLOWING_USERS, {
    variables: {
      userId: userId || undefined,
      limit: limit || undefined,
      skip: skip || undefined,
    },
    fetchPolicy: 'network-only',
    nextFetchPolicy: 'network-only',
    onCompleted: () => {
      if (data?.followingUsers) {
        if (data.followingUsers.length < (limit || 0)) {
          setHasMore(false);
        }
      }
    },
    onError: errorObj => {
      loggingService.error('Error fetching following users:', errorObj);
    },
  });

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
          userId,
          skip: data?.followingUsers?.length || 0,
          limit,
        },
        updateQuery: (prev, {fetchMoreResult}) => {
          if (!fetchMoreResult) {
            return prev;
          }

          const prevUsers = prev?.followingUsers || [];
          // Create a Set of existing user IDs to prevent duplicates
          const existingIds = new Set(prevUsers.map((user: any) => user.id));

          // Filter out any users that already exist
          const newUsers = fetchMoreResult.followingUsers.filter(
            (user: any) => !existingIds.has(user.id),
          );

          return {
            followingUsers: [...prevUsers, ...newUsers],
          };
        },
      });

      if (result.data.followingUsers.length < (limit || 0)) {
        setHasMore(false);
      }
    } catch (errorObj) {
      loggingService.error('Error loading more following users:', errorObj);
    }
  }, [fetchMore, hasMore, limit, loading, userId]);

  return {
    followingUsers: (data?.followingUsers as IUserFollowing[]) || [],
    loading,
    error,
    refetch,
    loadMore,
    hasMore,
  };
};

/**
 * Hook for getting users who follow the current user or specified user
 * @param userId Optional ID of the user to get followers for (if not provided, gets current user's followers)
 * @param limit Optional number of follower users to fetch (for pagination)
 * @param skip Optional number of follower users to skip (for pagination)
 * @returns The follower users list, loading state, error state, and helper functions
 */
export const useFollowerUsers = (
  userId?: string,
  limit?: number,
  skip?: number,
) => {
  const [hasMore, setHasMore] = useState(true);

  const {
    data,
    loading,
    error,
    refetch: originalRefetch,
    fetchMore,
  } = useQuery(GET_FOLLOWER_USERS, {
    variables: {
      userId: userId || undefined,
      limit: limit || undefined,
      skip: skip || undefined,
    },
    fetchPolicy: 'network-only',
    nextFetchPolicy: 'network-only',
    onCompleted: () => {
      if (data?.followerUsers) {
        if (data.followerUsers.length < (limit || 0)) {
          setHasMore(false);
        }
      }
    },
    onError: errorObj => {
      loggingService.error('Error fetching follower users:', errorObj);
    },
  });

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
          userId,
          skip: data?.followerUsers?.length || 0,
          limit,
        },
        updateQuery: (prev, {fetchMoreResult}) => {
          if (!fetchMoreResult) {
            return prev;
          }

          const prevUsers = prev?.followerUsers || [];
          // Create a Set of existing user IDs to prevent duplicates
          const existingIds = new Set(prevUsers.map((user: any) => user.id));

          // Filter out any users that already exist
          const newUsers = fetchMoreResult.followerUsers.filter(
            (user: any) => !existingIds.has(user.id),
          );

          return {
            followerUsers: [...prevUsers, ...newUsers],
          };
        },
      });

      if (result.data.followerUsers.length < (limit || 0)) {
        setHasMore(false);
      }
    } catch (errorObj) {
      loggingService.error('Error loading more follower users:', errorObj);
    }
  }, [fetchMore, hasMore, limit, loading, userId]);

  return {
    followerUsers: (data?.followerUsers as IUserFollowing[]) || [],
    loading,
    error,
    refetch,
    loadMore,
    hasMore,
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
  useFollowingUsers,
  useFollowerUsers,
};

export default FollowService;
