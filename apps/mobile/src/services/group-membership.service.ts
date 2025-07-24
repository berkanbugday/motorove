import {useMutation, Reference} from '@apollo/client';
import {
  ADD_MEMBER,
  CHANGE_MEMBER_ROLE,
  REMOVE_MEMBER,
  GROUP_MEMBERSHIP_FRAGMENT,
} from './graphql/group-membership.graphql';
import {loggingService} from './logging.service';
import {showToast} from '@components';
import {useTranslation} from '@hooks/useTranslation';
import {IAddMember, IChangeMemberRole, IRemoveMember} from '@motorove/shared';

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

// Hook to remove a member from a group
export const useRemoveMember = (onSuccess?: () => void) => {
  const {t} = useTranslation();
  const [removeMemberMutation, {loading, error}] = useMutation(REMOVE_MEMBER, {
    update(cache, {data: {removeMember}}) {
      // Update the cache to remove the deleted membership
      cache.modify({
        fields: {
          groupMembers(existingMembers = [], {readField}) {
            return existingMembers.filter(
              (memberRef: Reference) =>
                readField('id', memberRef) !== removeMember,
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

// Hook to change a member's role
export const useChangeMemberRole = (onSuccess?: () => void) => {
  const {t} = useTranslation();
  const [changeMemberRoleMutation, {loading, error}] = useMutation(
    CHANGE_MEMBER_ROLE,
    {
      update(cache, {data: {changeMemberRole}}) {
        // Update the cache to include the new group membership
        cache.modify({
          fields: {
            groupMembers(existingMembers = [], {readField}) {
              return existingMembers.map((memberRef: Reference) => {
                if (readField('id', memberRef) === changeMemberRole.id) {
                  return cache.writeFragment({
                    data: changeMemberRole,
                    fragment: GROUP_MEMBERSHIP_FRAGMENT,
                  });
                }
                return memberRef;
              });
            },
          },
        });
      },
      onCompleted: () => {
        showToast({
          type: 'success',
          text1: t('common.success'),
          text2: t('screens.group.success_changed_role'),
        });

        if (onSuccess) {
          onSuccess();
        }
      },
      onError: errorObj => {
        loggingService.error('Error changing member role:', errorObj);
        showToast({
          type: 'error',
          text1: t('common.error'),
          text2: errorObj.message || t('screens.group.error_changing_role'),
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
};

export default GroupMembershipService;
