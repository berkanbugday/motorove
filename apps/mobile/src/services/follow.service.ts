import {useLazyQuery, useMutation, useQuery} from '@apollo/client';
import {
  CHECK_IS_FOLLOWING,
  FOLLOW_USER,
  GET_MY_FOLLOWERS,
  GET_MY_FOLLOWING,
  GET_USER_FOLLOWERS,
  GET_USER_FOLLOWING,
  UNFOLLOW_USER,
} from './graphql/follow.graphql';
import {User} from '../types';
import {loggingService} from './logging.service';
import {showToast} from '@components';

/**
 * Hook for getting current user's followers
 * @param limit Optional number of followers to fetch (for pagination)
 * @param skip Optional number of followers to skip (for pagination)
 * @returns The followers list, loading state, error state, and refetch function
 */
export const useMyFollowers = (limit?: number, skip?: number) => {
  const {data, loading, error, refetch, fetchMore} = useQuery(
    GET_MY_FOLLOWERS,
    {
      variables: {limit, skip},
      fetchPolicy: 'network-only',
      onError: errorObj => {
        loggingService.error('Error getting my followers:', errorObj);
      },
    },
  );

  const loadMore = (newSkip: number, newLimit?: number) => {
    return fetchMore({
      variables: {
        skip: newSkip,
        limit: newLimit || limit,
      },
      updateQuery: (prev, {fetchMoreResult}) => {
        if (!fetchMoreResult) {
          return prev;
        }
        return {
          myFollowers: [...prev.myFollowers, ...fetchMoreResult.myFollowers],
        };
      },
    });
  };

  return {
    followers: (data?.myFollowers as User[]) || [],
    loading,
    error,
    refetch,
    loadMore,
  };
};

/**
 * Hook for getting users the current user follows
 * @param limit Optional number of following to fetch (for pagination)
 * @param skip Optional number of following to skip (for pagination)
 * @returns The following list, loading state, error state, and refetch function
 */
export const useMyFollowing = (limit?: number, skip?: number) => {
  const {data, loading, error, refetch, fetchMore} = useQuery(
    GET_MY_FOLLOWING,
    {
      variables: {limit, skip},
      fetchPolicy: 'network-only',
      onError: errorObj => {
        loggingService.error('Error getting my following:', errorObj);
      },
    },
  );

  const loadMore = (newSkip: number, newLimit?: number) => {
    return fetchMore({
      variables: {
        skip: newSkip,
        limit: newLimit || limit,
      },
      updateQuery: (prev, {fetchMoreResult}) => {
        if (!fetchMoreResult) {
          return prev;
        }
        return {
          myFollowing: [...prev.myFollowing, ...fetchMoreResult.myFollowing],
        };
      },
    });
  };

  return {
    following: (data?.myFollowing as User[]) || [],
    loading,
    error,
    refetch,
    loadMore,
  };
};

/**
 * Hook for getting a specific user's followers
 * @param userId The ID of the user to get followers for
 * @param limit Optional number of followers to fetch (for pagination)
 * @param skip Optional number of followers to skip (for pagination)
 * @returns The followers list, loading state, error state, and refetch function
 */
export const useUserFollowers = (
  userId: string,
  limit?: number,
  skip?: number,
) => {
  const {data, loading, error, refetch, fetchMore} = useQuery(
    GET_USER_FOLLOWERS,
    {
      variables: {userId, limit, skip},
      fetchPolicy: 'network-only',
      skip: !userId,
      onError: errorObj => {
        loggingService.error('Error getting user followers:', errorObj);
      },
    },
  );

  const loadMore = (newSkip: number, newLimit?: number) => {
    return fetchMore({
      variables: {
        userId,
        skip: newSkip,
        limit: newLimit || limit,
      },
      updateQuery: (prev, {fetchMoreResult}) => {
        if (!fetchMoreResult) {
          return prev;
        }
        return {
          userFollowers: [
            ...prev.userFollowers,
            ...fetchMoreResult.userFollowers,
          ],
        };
      },
    });
  };

  return {
    followers: (data?.userFollowers as User[]) || [],
    loading,
    error,
    refetch,
    loadMore,
  };
};

/**
 * Hook for getting users that a specific user follows
 * @param userId The ID of the user to get following for
 * @param limit Optional number of following to fetch (for pagination)
 * @param skip Optional number of following to skip (for pagination)
 * @returns The following list, loading state, error state, and refetch function
 */
export const useUserFollowing = (
  userId: string,
  limit?: number,
  skip?: number,
) => {
  const {data, loading, error, refetch, fetchMore} = useQuery(
    GET_USER_FOLLOWING,
    {
      variables: {userId, limit, skip},
      fetchPolicy: 'network-only',
      skip: !userId,
      onError: errorObj => {
        loggingService.error('Error getting user following:', errorObj);
      },
    },
  );

  const loadMore = (newSkip: number, newLimit?: number) => {
    return fetchMore({
      variables: {
        userId,
        skip: newSkip,
        limit: newLimit || limit,
      },
      updateQuery: (prev, {fetchMoreResult}) => {
        if (!fetchMoreResult) {
          return prev;
        }
        return {
          userFollowing: [
            ...prev.userFollowing,
            ...fetchMoreResult.userFollowing,
          ],
        };
      },
    });
  };

  return {
    following: (data?.userFollowing as User[]) || [],
    loading,
    error,
    refetch,
    loadMore,
  };
};

/**
 * Hook for checking if current user is following another user
 * @returns A function to check following status and loading state
 */
export const useCheckIsFollowing = () => {
  const [checkIsFollowing, {loading}] = useLazyQuery(CHECK_IS_FOLLOWING, {
    onError: errorObj => {
      loggingService.error('Error checking following status:', errorObj);
    },
  });

  const isFollowing = async (userId: string): Promise<boolean> => {
    try {
      const {data} = await checkIsFollowing({
        variables: {userId},
      });
      return !!data?.isFollowing;
    } catch (error) {
      loggingService.error('Error checking following status:', error);
      return false;
    }
  };

  return {
    isFollowing,
    loading,
  };
};

/**
 * Hook for following a user
 * @param onSuccess Optional callback function to execute on successful follow
 * @returns A function to follow a user and loading state
 */
export const useFollowUser = (onSuccess?: (isFollowing: boolean) => void) => {
  const [followUserMutation, {loading}] = useMutation(FOLLOW_USER, {
    onCompleted: _data => {
      if (onSuccess) {
        onSuccess(true);
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
    refetchQueries: [
      {query: GET_MY_FOLLOWING},
      {query: GET_USER_FOLLOWERS, variables: {userId: ''}},
    ],
  });

  const followUser = async (userId: string) => {
    try {
      const result = await followUserMutation({
        variables: {
          input: {userId},
        },
        refetchQueries: [
          {query: GET_MY_FOLLOWING},
          {query: GET_USER_FOLLOWERS, variables: {userId}},
        ],
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
export const useUnfollowUser = (onSuccess?: (isFollowing: boolean) => void) => {
  const [unfollowUserMutation, {loading}] = useMutation(UNFOLLOW_USER, {
    onCompleted: _data => {
      if (onSuccess) {
        onSuccess(false);
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
    refetchQueries: [
      {query: GET_MY_FOLLOWING},
      {query: GET_USER_FOLLOWERS, variables: {userId: ''}}, // Will be updated in the call
    ],
  });

  const unfollowUser = async (userId: string) => {
    try {
      const result = await unfollowUserMutation({
        variables: {
          input: {userId},
        },
        refetchQueries: [
          {query: GET_MY_FOLLOWING},
          {query: GET_USER_FOLLOWERS, variables: {userId}},
        ],
      });
      return result.data?.unfollowUser;
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
  useMyFollowers,
  useMyFollowing,
  useUserFollowers,
  useUserFollowing,
  useCheckIsFollowing,
  useFollowUser,
  useUnfollowUser,
};

export default FollowService;
