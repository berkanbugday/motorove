import {useState, useCallback} from 'react';
import {useTranslation} from '@hooks/useTranslation';
import {loggingService} from '@services/logging.service';
import {showToast} from '@components';
import {
  useAddMember,
  useChangeMemberRole,
  useRemoveMember,
} from '@services/group-membership.service';
import {IGroup, GroupPrivacy, GroupMemberRole} from '@motorove/shared';
import {EnumUtils} from '@utils/enumUtils';
import {DropdownItem} from '@components';

type UseGroupMemberActionsProps = {
  groupId: string;
  group: IGroup | undefined;
  onMemberAdded?: () => void;
  onMemberRemoved?: () => void;
  onRoleChanged?: () => void;
};

/**
 * Hook to handle group member actions (add, remove, change role)
 */
export const useGroupMemberActions = ({
  groupId,
  group,
  onMemberAdded,
  onMemberRemoved,
  onRoleChanged,
}: UseGroupMemberActionsProps) => {
  const {t} = useTranslation();
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [memberToRemove, setMemberToRemove] = useState<any>(null);
  const [selectedRole, setSelectedRole] = useState<DropdownItem | null>(null);

  const {addMember} = useAddMember(() => {
    if (group?.privacy === GroupPrivacy.PUBLIC) {
      showToast({
        text1: t('common.success'),
        text2: t('screens.group.join_success'),
        type: 'success',
      });
    } else {
      showToast({
        text1: t('common.success'),
        text2: t('screens.group.join_request_sent'),
        type: 'success',
      });
    }
    onMemberAdded?.();
  });

  const {changeMemberRole, loading: changeMemberRoleLoading} =
    useChangeMemberRole(() => {
      onRoleChanged?.();
    });

  const {removeMember, loading: removeMemberLoading} = useRemoveMember(() => {
    onMemberRemoved?.();
  });

  const handleOpenRemoveMemberBottomSheet = useCallback((member: any) => {
    setMemberToRemove(member);
  }, []);

  const handleRemoveMember = useCallback(
    async (member: any) => {
      if (!member) {
        return;
      }

      try {
        const result = await removeMember({
          groupId,
          userId: member.user.id,
        });
        if (result) {
          showToast({
            type: 'success',
            text1: t('common.success'),
            text2: t('screens.group.success_removed_member'),
          });
        }
      } catch (error) {
        loggingService.error('Error removing member', error);
        showToast({
          text1: t('common.error'),
          text2: t('errors.general.something_wrong'),
          type: 'error',
        });
      }
    },
    [groupId, removeMember, t],
  );

  const handleOpenChangeRoleBottomSheet = useCallback((member: any) => {
    setSelectedMember(member);
    // Find the current role in the dropdown items
    const currentRole = EnumUtils.getGroupMemberRoles().find(
      role => role.value === member.role,
    );
    setSelectedRole(currentRole || null);
  }, []);

  const handleChangeRole = useCallback(
    async (member: any, role: GroupMemberRole) => {
      if (!member || !role) {
        return;
      }

      try {
        if (member.role !== role) {
          await changeMemberRole({
            groupId,
            userId: member.user.id,
            role: role as GroupMemberRole,
          });
        }
      } catch (error) {
        loggingService.error('Error changing member role', error);
        showToast({
          text1: t('common.error'),
          text2: t('errors.general.something_wrong'),
          type: 'error',
        });
      }
    },
    [groupId, changeMemberRole, t],
  );

  const handleJoinGroup = useCallback(
    async (userId: string | null, verifiedIsPendingMember: boolean) => {
      if (verifiedIsPendingMember) {
        loggingService.info(`Group: ${groupId} is pending. Cannot join.`);
        showToast({
          text1: t('common.warning'),
          text2: t('screens.group.group_pending'),
          type: 'warning',
        });
        return;
      }

      if (
        group?.membersCapacity &&
        group?.membersCount &&
        group?.membersCount >= group?.membersCapacity
      ) {
        loggingService.info(`Group: ${groupId} is full. Cannot join.`);
        showToast({
          text1: t('common.warning'),
          text2: t('screens.group.group_full'),
          type: 'warning',
        });
        return;
      }

      try {
        if (userId) {
          await addMember({
            groupId,
            userId,
          });
        }
      } catch (error) {
        loggingService.error(`Error joining group: ${groupId}`, error);
        showToast({
          text1: t('common.error'),
          text2: t('errors.general.something_wrong'),
          type: 'error',
        });
      }
    },
    [
      addMember,
      groupId,
      group?.membersCapacity,
      group?.membersCount,
      group?.privacy,
      t,
    ],
  );

  const handleLeaveGroup = useCallback(
    async (userId: string | null) => {
      if (group?.isOwner) {
        showToast({
          text1: t('common.warning'),
          text2: t('screens.group.cannot_leave_group'),
          type: 'warning',
        });
        return;
      }

      if (userId) {
        try {
          const result = await removeMember({groupId, userId});
          if (result) {
            showToast({
              type: 'success',
              text1: t('common.success'),
              text2: t('screens.group.success_left_group'),
            });
          }
        } catch (error) {
          loggingService.error(`Error leaving group: ${groupId}`, error);
        }
      }
    },
    [groupId, removeMember, group?.isOwner, t],
  );

  const handleRoleSelect = useCallback((item: DropdownItem | null) => {
    setSelectedRole(item);
  }, []);

  return {
    // State
    selectedMember,
    memberToRemove,
    selectedRole,

    // Actions
    handleOpenRemoveMemberBottomSheet,
    handleRemoveMember,
    handleOpenChangeRoleBottomSheet,
    handleChangeRole,
    handleJoinGroup,
    handleLeaveGroup,
    handleRoleSelect,

    // Loading states
    changeMemberRoleLoading,
    removeMemberLoading,
  };
};
