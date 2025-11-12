import React, {useMemo, useCallback, useState} from 'react';
import {View, FlatList, StyleSheet} from 'react-native';
import {IGroup, GroupMemberRole, ApprovalStatus} from '@motorove/shared';
import {AuthUser} from '@app-types/auth.types';
import {MainScreenNavigationProp} from '@navigation/types/navigationTypes';
import {
  openBottomSheet,
  closeBottomSheet,
} from '@components/BottomSheet/BottomSheetProvider';
import {LoadingIndicator} from '@components';
import {
  Subtitle,
  Caption,
  Body,
  Button,
  Dropdown,
  DropdownItem,
} from '@components';
import {colors, spacing} from '@theme';
import {useTranslation} from '@hooks/useTranslation';
import {EnumUtils} from '@utils/enumUtils';

export type UseGroupMembershipProps = {
  group: IGroup | undefined;
  user: AuthUser | null;
  groupLoading?: boolean;
  navigation?: MainScreenNavigationProp<'GroupDetail'>;
  onChangeRoleConfirm?: (member: any, role: GroupMemberRole) => Promise<void>;
  onRemoveMemberConfirm?: (member: any) => Promise<void>;
  changeMemberRoleLoading?: boolean;
  removeMemberLoading?: boolean;
  MemberItemComponent?: React.ComponentType<{
    item: any;
    isAdmin?: boolean;
    isMember?: boolean;
    user: AuthUser;
    navigation?: MainScreenNavigationProp<'GroupDetail'>;
    onChangeRole?: (member: any) => void;
    onRemoveMember?: (member: any) => void;
  }>;
};

/**
 * Hook to verify group membership status and handle members bottom sheet
 */
export const useGroupMembership = ({
  group,
  user,
  groupLoading = false,
  navigation,
  onChangeRoleConfirm,
  onRemoveMemberConfirm,
  changeMemberRoleLoading = false,
  removeMemberLoading = false,
  MemberItemComponent,
}: UseGroupMembershipProps) => {
  const verifiedIsMember = useMemo(() => {
    if (!group || !user?.id) {
      return false;
    }

    // If backend says user is a member, trust it
    if (group.isMember === true) {
      return true;
    }

    // Otherwise, check memberships array as fallback
    if (group.memberships) {
      const userMembership = group.memberships.find(
        m => m.user.id === user.id && m.status === ApprovalStatus.ACCEPTED,
      );
      return !!userMembership;
    }

    return group.isMember ?? false;
  }, [group?.isMember, group?.memberships, user?.id]);

  const verifiedIsAdmin = useMemo(() => {
    if (!group || !user?.id || !verifiedIsMember) {
      return false;
    }

    // If backend says user is admin, trust it
    if (group.isAdmin === true) {
      return true;
    }

    // Otherwise, check memberships array as fallback
    if (group.memberships) {
      const userMembership = group.memberships.find(
        m => m.user.id === user.id && m.status === ApprovalStatus.ACCEPTED,
      );
      return !!userMembership && userMembership.role === GroupMemberRole.ADMIN;
    }

    return group.isAdmin ?? false;
  }, [group?.isAdmin, group?.memberships, user?.id, verifiedIsMember]);

  const verifiedIsPendingMember = useMemo(() => {
    if (!group || !user?.id) {
      return false;
    }

    // If backend says user is pending, trust it
    if (group.isPendingMember === true) {
      return true;
    }

    // Otherwise, check memberships array as fallback
    if (group.memberships) {
      const userMembership = group.memberships.find(
        m => m.user.id === user.id && m.status === ApprovalStatus.PENDING,
      );
      return !!userMembership;
    }

    return group.isPendingMember ?? false;
  }, [group?.isPendingMember, group?.memberships, user?.id]);

  const {t} = useTranslation();
  const members = group?.memberships || [];

  // Forward declaration to avoid circular dependency
  const openMembersBottomSheetRef = React.useRef<(() => void) | null>(null);

  const handleOpenChangeRoleBottomSheet = useCallback(
    (member: any, reopenMembers: boolean = false) => {
      const currentRole = EnumUtils.getGroupMemberRoles().find(
        role => role.value === member.role,
      );
      let tempSelectedRole = currentRole || null;

      const ChangeRoleContent = () => {
        const [localSelectedRole, setLocalSelectedRole] =
          useState<DropdownItem | null>(tempSelectedRole);

        return (
          <View style={styles.changeRoleContainer}>
            <View style={styles.changeRoleContent}>
              <Dropdown
                label={t('screens.group.role')}
                data={EnumUtils.getGroupMemberRoles()}
                selectedItem={localSelectedRole}
                onSelect={setLocalSelectedRole}
                showClearButton={false}
                loading={groupLoading}
              />
            </View>

            <View style={styles.buttonsContainer}>
              <Button
                title={t('common.cancel')}
                variant="outline"
                shape="round"
                onPress={() => {
                  closeBottomSheet();
                  if (reopenMembers && openMembersBottomSheetRef.current) {
                    // Small delay to ensure smooth transition
                    setTimeout(
                      () => openMembersBottomSheetRef.current?.(),
                      300,
                    );
                  }
                }}
                style={{flex: 1}}
              />
              <Button
                title={t('common.change')}
                variant="primary"
                shape="round"
                textStyle={{color: colors.neutral.white}}
                onPress={async () => {
                  if (localSelectedRole && onChangeRoleConfirm) {
                    await onChangeRoleConfirm(
                      member,
                      localSelectedRole.value as GroupMemberRole,
                    );
                    closeBottomSheet();
                  }
                }}
                disabled={!localSelectedRole}
                loading={changeMemberRoleLoading}
                style={{flex: 1}}
              />
            </View>
          </View>
        );
      };

      openBottomSheet({
        snapPoint: 'partial',
        closeOnBackdropPress: true,
        showCloseButton: false,
        enableGestureControl: false,
        onClose: () => {
          if (reopenMembers && openMembersBottomSheetRef.current) {
            // Small delay to ensure smooth transition
            setTimeout(() => openMembersBottomSheetRef.current?.(), 300);
          }
        },
        title: t('screens.group.change_role'),
        subtitle: `${member.user.firstName} ${member.user.lastName}`,
        closeButtonPosition: 'top-right',
        content: <ChangeRoleContent />,
      });
    },
    [t, groupLoading, onChangeRoleConfirm, changeMemberRoleLoading],
  );

  const handleOpenRemoveMemberBottomSheet = useCallback(
    (member: any, reopenMembers: boolean = false) => {
      openBottomSheet({
        snapPoint: 'minimal',
        closeOnBackdropPress: true,
        showCloseButton: false,
        enableGestureControl: false,
        title: t('screens.group.remove_member'),
        subtitle: `${member.user.firstName} ${member.user.lastName}`,
        closeButtonPosition: 'top-right',
        onClose: () => {
          if (reopenMembers && openMembersBottomSheetRef.current) {
            // Small delay to ensure smooth transition
            setTimeout(() => openMembersBottomSheetRef.current?.(), 300);
          }
        },
        content: (
          <View style={styles.removeMemberContainer}>
            <Body align="center">
              {t('screens.group.remove_member_confirmation', {
                memberName: `${member.user.firstName} ${member.user.lastName}`,
              })}
            </Body>

            <View style={styles.buttonsContainer}>
              <Button
                title={t('common.no')}
                variant="outline"
                shape="round"
                onPress={() => {
                  closeBottomSheet();
                  if (reopenMembers && openMembersBottomSheetRef.current) {
                    // Small delay to ensure smooth transition
                    setTimeout(
                      () => openMembersBottomSheetRef.current?.(),
                      300,
                    );
                  }
                }}
                style={{flex: 1}}
              />
              <Button
                title={t('common.yes')}
                variant="primary"
                shape="round"
                onPress={async () => {
                  if (onRemoveMemberConfirm) {
                    await onRemoveMemberConfirm(member);
                    closeBottomSheet();
                  }
                }}
                loading={removeMemberLoading}
                style={{flex: 1}}
              />
            </View>
          </View>
        ),
      });
    },
    [t, onRemoveMemberConfirm, removeMemberLoading],
  );

  const renderMemberItem = useCallback(
    ({item}: {item: any}) => {
      if (!user || !MemberItemComponent) {
        return null;
      }

      return (
        <MemberItemComponent
          item={item}
          isAdmin={verifiedIsAdmin}
          isMember={verifiedIsMember}
          user={user}
          navigation={navigation}
          onChangeRole={(member: any) =>
            handleOpenChangeRoleBottomSheet(member, true)
          }
          onRemoveMember={(member: any) =>
            handleOpenRemoveMemberBottomSheet(member, true)
          }
        />
      );
    },
    [
      user,
      MemberItemComponent,
      verifiedIsAdmin,
      verifiedIsMember,
      navigation,
      handleOpenChangeRoleBottomSheet,
      handleOpenRemoveMemberBottomSheet,
    ],
  );

  const openMembersBottomSheet = useCallback(() => {
    openBottomSheet({
      snapPoint: 'full',
      closeOnBackdropPress: true,
      showCloseButton: false,
      header: (
        <View style={styles.membersHeader}>
          <View>
            <Subtitle>{t('screens.group.members')}</Subtitle>
            <Caption color={colors.neutral.grey}>
              {members.length} {t('screens.group.people')}
            </Caption>
          </View>
        </View>
      ),
      content: groupLoading ? (
        <LoadingIndicator visible={true} />
      ) : (
        <FlatList
          data={members}
          renderItem={renderMemberItem}
          keyExtractor={(item: any) => item.id}
          contentContainerStyle={styles.membersList}
          showsVerticalScrollIndicator={false}
        />
      ),
    });
  }, [members, renderMemberItem, groupLoading, t]);

  // Assign ref after function is created
  React.useEffect(() => {
    openMembersBottomSheetRef.current = openMembersBottomSheet;
  }, [openMembersBottomSheet]);

  const closeMembersBottomSheet = useCallback(() => {
    closeBottomSheet();
  }, []);

  return {
    verifiedIsMember,
    verifiedIsAdmin,
    verifiedIsPendingMember,
    openMembersBottomSheet,
    closeMembersBottomSheet,
    handleOpenChangeRoleBottomSheet,
    handleOpenRemoveMemberBottomSheet,
  };
};

const styles = StyleSheet.create({
  membersHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  membersList: {
    flex: 1,
    paddingBottom: spacing.lg,
  },
  loadingContainer: {
    padding: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  changeRoleContent: {
    padding: spacing.md,
  },
  changeRoleContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  removeMemberContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  buttonsContainer: {
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.secondary.main,
    paddingVertical: spacing.md,
    marginVertical: spacing.md,
  },
});
