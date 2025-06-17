import {useMutation, useQuery, Reference} from '@apollo/client';
import {useCallback} from 'react';
import {
  GET_GROUP_MEMBERSHIPS,
  GET_GROUP_MEMBERS,
  GET_MY_GROUP_MEMBERSHIPS,
  GET_GROUP_MEMBERSHIP,
  ADD_GROUP_MEMBER,
  CHANGE_MEMBER_ROLE,
  REMOVE_GROUP_MEMBER,
  LEAVE_GROUP,
  GROUP_MEMBERSHIP_FRAGMENT,
  CHANGE_MEMBER_ROLE_FRAGMENT,
} from './graphql/group-membership.graphql';
import {loggingService} from './logging.service';
import {showToast} from '@components';

// Hook to get all group memberships
export const useGroupMemberships = () => {
  return useQuery(GET_GROUP_MEMBERSHIPS);
};

// Hook to get members of a specific group
export const useGroupMembers = (groupId: string) => {
  return useQuery(GET_GROUP_MEMBERS, {
    variables: {groupId},
    skip: !groupId,
  });
};

// Hook to get current user's group memberships
export const useMyGroupMemberships = () => {
  return useQuery(GET_MY_GROUP_MEMBERSHIPS);
};

// Hook to get a specific group membership
export const useGroupMembership = (id: string) => {
  return useQuery(GET_GROUP_MEMBERSHIP, {
    variables: {id},
    skip: !id,
  });
};

// Hook to add a member to a group
export const useAddGroupMember = () => {
  return useMutation(ADD_GROUP_MEMBER, {
    update(cache, {data: {addGroupMember}}) {
      // Update the cache to include the new group membership
      cache.modify({
        fields: {
          groupMembers(existingMembers = [], {readField}) {
            const newMemberRef = cache.writeFragment({
              data: addGroupMember,
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
  });
};

// Hook to change a member's role
export const useChangeMemberRole = () => {
  return useMutation(CHANGE_MEMBER_ROLE, {
    update(cache, {data: {changeMemberRole}}) {
      // Update the cache to include the new group membership
      cache.modify({
        fields: {
          groupMembers(existingMembers = [], {readField}) {
            return existingMembers.map((memberRef: Reference) => {
              if (readField('id', memberRef) === changeMemberRole.id) {
                return cache.writeFragment({
                  data: changeMemberRole,
                  fragment: CHANGE_MEMBER_ROLE_FRAGMENT,
                });
              }
              return memberRef;
            });
          },
        },
      });
    },
  });
};

// Hook to remove a member from a group
export const useRemoveGroupMember = () => {
  return useMutation(REMOVE_GROUP_MEMBER, {
    update(cache, {data: {removeGroupMember}}) {
      // Update the cache to remove the deleted membership
      cache.modify({
        fields: {
          groupMembers(existingMembers = [], {readField}) {
            return existingMembers.filter(
              (memberRef: Reference) =>
                readField('id', memberRef) !== removeGroupMember,
            );
          },
        },
      });
    },
  });
};

// Hook to leave a group
export const useLeaveGroup = () => {
  const [leaveGroupMutation, {loading, error}] = useMutation(LEAVE_GROUP, {
    update(cache, {data: {leaveGroup}}) {
      // Update the cache to remove the user's membership from the group
      cache.modify({
        fields: {
          groupMembers(existingMembers = [], {readField}) {
            return existingMembers.filter(
              (memberRef: Reference) =>
                !(
                  readField('groupId', memberRef) === leaveGroup.groupId &&
                  readField('userId', memberRef) === leaveGroup.userId
                ),
            );
          },
          myGroupMemberships(existingMemberships = [], {readField}) {
            return existingMemberships.filter(
              (membershipRef: Reference) =>
                readField('groupId', membershipRef) !== leaveGroup.groupId,
            );
          },
        },
      });

      // Also update the specific group cache to reflect the user is no longer a member
      cache.modify({
        id: cache.identify({__typename: 'Group', id: leaveGroup.groupId}),
        fields: {
          isMember() {
            return false;
          },
          isAdmin() {
            return false;
          },
          memberships(existingMemberships = [], {readField}) {
            return existingMemberships.filter(
              (membershipRef: Reference) =>
                readField('userId', membershipRef) !== leaveGroup.userId,
            );
          },
        },
      });
    },
  });

  const leaveGroup = useCallback(
    async (groupId: string) => {
      try {
        const result = await leaveGroupMutation({
          variables: {
            input: {
              groupId,
            },
          },
        });

        showToast({
          type: 'success',
          text1: 'Success',
          text2: 'You have left the group successfully!',
        });

        return result.data?.leaveGroup;
      } catch (err) {
        loggingService.error('Error leaving group:', err);
        showToast({
          type: 'error',
          text1: 'Error',
          text2: 'Failed to leave the group. Please try again.',
        });
        throw err;
      }
    },
    [leaveGroupMutation],
  );

  return {
    leaveGroup,
    loading,
    error,
  };
};

// Types for inputs
export interface AddGroupMemberInput {
  groupId: string;
  userId: string;
}

export interface ChangeMemberRoleInput {
  membershipId: string;
  role: string;
}

export interface RemoveGroupMemberInput {
  membershipId: string;
}

export interface UpdateGroupMembershipStatusInput {
  membershipId: string;
  status: string;
}

export interface LeaveGroupInput {
  groupId: string;
}
