import {useMutation, Reference, useQuery, gql} from '@apollo/client';
import {
  ADD_MEMBER,
  CHANGE_MEMBER_ROLE,
  REMOVE_MEMBER,
  GROUP_MEMBERSHIP_FRAGMENT,
  UPDATE_INVITATION_STATUS,
} from './graphql/group-membership.graphql';
import {loggingService} from './logging.service';
import {showToast} from '@components';
import {useTranslation} from '@hooks/useTranslation';
import {
  IAddMember,
  IChangeMemberRole,
  IRemoveMember,
  InvitationStatus,
} from '@motorove/shared';
import {useState, useCallback} from 'react';

// GraphQL query for fetching group join requests (members with PENDING status)
const GET_GROUP_JOIN_REQUESTS = gql`
  query GetGroupJoinRequests($limit: Int!, $skip: Int!) {
    groupJoinRequests(limit: $limit, skip: $skip) {
      id
      groupId
      user {
        id
        firstName
        lastName
        avatar
      }
      role
      status
      joinedAt
    }
  }
`;

// Hook to add a member to a group
export const useAddMember = (onSuccess?: () => void) => {
  const {t} = useTranslation();
  const [addMemberMutation, {loading, error}] = useMutation(ADD_MEMBER, {
    update(cache, {data: {addMember}}) {
      // Update the cache to include the new group membership
      cache.modify({
        fields: {
          groupMembers(existingMembers = [], {readField}) {
            const newMemberRef = cache.writeFragment({
              data: addMember,
              fragment: GROUP_MEMBERSHIP_FRAGMENT,
            });

            // Check if this member already exists in the cache
            if (
              existingMembers.some(
                (memberRef: Reference) =>
                  readField('id', memberRef) === readField('id', newMemberRef),
              )
            ) {
              return existingMembers;
            }

            return [...existingMembers, newMemberRef];
          },
        },
      });
    },
    onCompleted: () => {
      if (onSuccess) {
        onSuccess();
      }
    },
    onError: errorObj => {
      loggingService.error('Error adding member:', errorObj);
      showToast({
        type: 'error',
        text1: t('common.error'),
        text2: errorObj.message || t('screens.group.error_adding_member'),
      });
    },
  });

  const addMember = async (input: IAddMember) => {
    try {
      const result = await addMemberMutation({
        variables: {
          input,
        },
      });
      return result.data?.addMember;
    } catch (err) {
      loggingService.error('Error in addMember:', err);
      // Error is already handled in onError callback
      return null;
    }
  };

  return {
    addMember,
    loading,
    error,
  };
};

// Hook to fetch group join requests
export const useGetGroupJoinRequests = (limit = 20, skip = 0) => {
  const {t} = useTranslation();
  const [hasMore, setHasMore] = useState(true);
  const [joinRequests, setJoinRequests] = useState<any[]>([]);

  const {
    data,
    loading,
    error,
    refetch: originalRefetch,
    fetchMore,
  } = useQuery(GET_GROUP_JOIN_REQUESTS, {
    variables: {
      limit,
      skip,
    },
    fetchPolicy: 'network-only',
    nextFetchPolicy: 'network-only',
    onCompleted: data => {
      if (data?.groupJoinRequests) {
        setJoinRequests(data.groupJoinRequests);
        if (data.groupJoinRequests.length < limit) {
          setHasMore(false);
        }
      }
    },
    onError: errorObj => {
      loggingService.error('Error fetching group join requests:', errorObj);
    },
  });

  // Update invitation status mutation
  const [updateStatus, {loading: updateLoading}] = useMutation(
    UPDATE_INVITATION_STATUS,
    {
      onCompleted: () => {
        // Refetch the join requests
        originalRefetch();
      },
      onError: error => {
        loggingService.error('Error updating invitation status:', error);
        showToast({
          type: 'error',
          text1: t('common.error'),
          text2: error.message || t('errors.general.something_wrong'),
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
          skip: joinRequests.length,
          limit,
        },
        updateQuery: (prev, {fetchMoreResult}) => {
          if (!fetchMoreResult) {
            return prev;
          }

          return {
            groupJoinRequests: [
              ...prev.groupJoinRequests,
              ...fetchMoreResult.groupJoinRequests,
            ],
          };
        },
      });

      if (result.data.groupJoinRequests.length < limit) {
        setHasMore(false);
      }
    } catch (errorObj) {
      loggingService.error('Error loading more join requests:', errorObj);
    }
  }, [joinRequests.length, fetchMore, hasMore, limit, loading]);

  // Handle accept request
  const handleAccept = useCallback(
    async (membershipId: string) => {
      try {
        await updateStatus({
          variables: {
            input: {
              membershipId,
              status: InvitationStatus.ACCEPTED,
            },
          },
        });

        showToast({
          type: 'success',
          text1: t('common.success'),
          text2: t('screens.joinRequest.request_accepted'),
        });

        // Update local state to remove this request
        setJoinRequests(prev => prev.filter(item => item.id !== membershipId));
      } catch (error) {
        loggingService.error('Error accepting join request:', error);
      }
    },
    [updateStatus, t],
  );

  // Handle reject request
  const handleReject = useCallback(
    async (membershipId: string) => {
      try {
        await updateStatus({
          variables: {
            input: {
              membershipId,
              status: InvitationStatus.REJECTED,
            },
          },
        });

        showToast({
          type: 'success',
          text1: t('common.success'),
          text2: t('screens.joinRequest.request_rejected'),
        });

        // Update local state to remove this request
        setJoinRequests(prev => prev.filter(item => item.id !== membershipId));
      } catch (error) {
        loggingService.error('Error rejecting join request:', error);
      }
    },
    [updateStatus, t],
  );

  return {
    joinRequests,
    loading: loading || updateLoading,
    error,
    refetch,
    loadMore,
    hasMore,
    handleAccept,
    handleReject,
  };
};

// Hook to remove a member from a group
export const useRemoveMember = (onSuccess?: () => void) => {
  const {t} = useTranslation();
  const [removeMemberMutation, {loading, error}] = useMutation(REMOVE_MEMBER, {
    update(cache, {data: {removeMember}}) {
      // Update the cache to remove the member
      cache.modify({
        fields: {
          groupMembers(existingMembers = [], {readField}) {
            return existingMembers.filter(
              (memberRef: Reference) =>
                readField('id', memberRef) !== removeMember.id,
            );
          },
        },
      });
    },
    onCompleted: () => {
      if (onSuccess) {
        onSuccess();
      }
    },
    onError: errorObj => {
      loggingService.error('Error removing member:', errorObj);
      showToast({
        type: 'error',
        text1: t('common.error'),
        text2: errorObj.message || t('screens.group.error_removing_member'),
      });
    },
  });

  const removeMember = async (input: IRemoveMember) => {
    try {
      const result = await removeMemberMutation({
        variables: {
          input,
        },
      });
      return result.data?.removeMember;
    } catch (err) {
      loggingService.error('Error in removeMember:', err);
      // Error is already handled in onError callback
      return null;
    }
  };

  return {
    removeMember,
    loading,
    error,
  };
};

// Hook to change a member's role in a group
export const useChangeMemberRole = () => {
  const {t} = useTranslation();
  const [changeMemberRoleMutation, {loading, error}] = useMutation(
    CHANGE_MEMBER_ROLE,
    {
      onCompleted: () => {
        showToast({
          type: 'success',
          text1: t('common.success'),
          text2: t('screens.group.member_role_updated'),
        });
      },
      onError: errorObj => {
        loggingService.error('Error changing member role:', errorObj);
        showToast({
          type: 'error',
          text1: t('common.error'),
          text2:
            errorObj.message || t('screens.group.error_changing_member_role'),
        });
      },
    },
  );

  const changeMemberRole = async (input: IChangeMemberRole) => {
    try {
      const result = await changeMemberRoleMutation({
        variables: {
          input,
        },
      });
      return result.data?.changeMemberRole;
    } catch (err) {
      loggingService.error('Error in changeMemberRole:', err);
      // Error is already handled in onError callback
      return null;
    }
  };

  return {
    changeMemberRole,
    loading,
    error,
  };
};

// Export as GroupMembershipService object
export const GroupMembershipService = {
  useAddMember,
  useRemoveMember,
  useChangeMemberRole,
  useGetGroupJoinRequests,
};

export default GroupMembershipService;
