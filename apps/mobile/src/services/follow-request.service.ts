import {useMutation, useQuery} from '@apollo/client';
import {
  GET_MY_FOLLOW_REQUESTS,
  ACCEPT_FOLLOW_REQUEST,
  REJECT_FOLLOW_REQUEST,
} from './graphql/follow-request.graphql';
import {loggingService} from './logging.service';
import {showToast} from '@components';

interface FollowRequest {
  id: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    username: string;
    avatar?: string;
  };
  createdAt: Date;
  status: string;
}

/**
 * Hook for getting current user's follow requests
 * @param limit Optional number of requests to fetch (for pagination)
 * @param skip Optional number of requests to skip (for pagination)
 * @returns The follow requests list, loading state, error state, and refetch/handling functions
 */
export const useGetMyFollowRequests = (limit?: number, skip?: number) => {
  const {data, loading, error, refetch, fetchMore} = useQuery(
    GET_MY_FOLLOW_REQUESTS,
    {
      variables: {limit, skip},
      fetchPolicy: 'network-only',
      onError: errorObj => {
        loggingService.error('Error getting follow requests:', errorObj);
      },
    },
  );

  // Handle accepting follow request
  const [acceptFollowRequestMutation, {loading: acceptLoading}] = useMutation(
    ACCEPT_FOLLOW_REQUEST,
    {
      onError: errorObj => {
        loggingService.error('Error accepting follow request:', errorObj);
        showToast({
          type: 'error',
          text1: 'Error',
          text2:
            errorObj.message || 'Failed to accept follow request. Please try again.',
        });
      },
      refetchQueries: [{query: GET_MY_FOLLOW_REQUESTS}],
    },
  );

  // Handle rejecting follow request
  const [rejectFollowRequestMutation, {loading: rejectLoading}] = useMutation(
    REJECT_FOLLOW_REQUEST,
    {
      onError: errorObj => {
        loggingService.error('Error rejecting follow request:', errorObj);
        showToast({
          type: 'error',
          text1: 'Error',
          text2:
            errorObj.message || 'Failed to reject follow request. Please try again.',
        });
      },
      refetchQueries: [{query: GET_MY_FOLLOW_REQUESTS}],
    },
  );

  const handleAccept = async (requestId: string) => {
    try {
      await acceptFollowRequestMutation({
        variables: {id: requestId},
      });
      showToast({
        type: 'success',
        text1: 'Success',
        text2: 'Follow request accepted',
      });
      refetch();
    } catch (err) {
      loggingService.error('Error in handleAccept:', err);
    }
  };

  const handleReject = async (requestId: string) => {
    try {
      await rejectFollowRequestMutation({
        variables: {id: requestId},
      });
      showToast({
        type: 'success',
        text1: 'Success',
        text2: 'Follow request rejected',
      });
      refetch();
    } catch (err) {
      loggingService.error('Error in handleReject:', err);
    }
  };

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
          myFollowRequests: [
            ...prev.myFollowRequests,
            ...fetchMoreResult.myFollowRequests,
          ],
        };
      },
    });
  };

  return {
    followRequests: (data?.myFollowRequests as FollowRequest[]) || [],
    loading,
    error,
    refetch,
    loadMore,
    handleAccept,
    handleReject,
    acceptLoading,
    rejectLoading,
  };
};

/**
 * Export as FollowRequestService object
 */
export const FollowRequestService = {
  useGetMyFollowRequests,
};

export default FollowRequestService;
