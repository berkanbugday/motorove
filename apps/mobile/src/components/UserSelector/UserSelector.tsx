import React, {useCallback, useMemo, useState, useEffect} from 'react';
import {useTranslation} from '@hooks/useTranslation';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  ViewStyle,
  ActivityIndicator,
  FlatList,
  Animated,
} from 'react-native';
import {colors, spacing, radius} from '@theme';
import {Typography, Icon, Chip, Button} from '@components';
import {openBottomSheet} from '@components/BottomSheet';
import {FollowService} from '@services/user-following.service';
import type {IUser} from '@motorove/shared';
import {useAuth} from '@contexts';

export interface UserSelectorProps {
  selectedUsers: string[];
  onUsersChange: (userIds: string[]) => void;
  style?: ViewStyle;
  disabled?: boolean;
  maxUsers?: number;
}

interface UserItemProps {
  user: IUser;
  isSelected: boolean;
  onToggle: (userId: string) => void;
  disabled?: boolean;
}

interface BottomSheetContentProps {
  users: IUser[];
  selectedUsers: string[];
  loading: boolean;
  error: any;
  refetch: () => void;
  loadMore: () => void;
  onSelectionChange: (selectedIds: string[]) => void;
  disabled: boolean;
  maxUsers: number;
}

// Utility function to get user's display name
const getUserName = (user: IUser, t: any): string => {
  if (user.firstName && user.lastName) {
    return `${user.firstName} ${user.lastName}`;
  }
  if (user.firstName) {
    return user.firstName;
  }
  return t('components.userSelector.unknown_user');
};

const UserItem: React.FC<UserItemProps> = ({
  user,
  isSelected,
  onToggle,
  disabled,
}) => {
  const {t} = useTranslation();
  // Add animation value for selection indicator
  const [scaleAnim] = useState(new Animated.Value(1));

  const handlePress = () => {
    if (!disabled) {
      // Animate the selection indicator
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 0.8,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();

      onToggle(user.id);
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.userItem,
        isSelected && styles.userItemSelected,
        disabled && styles.userItemDisabled,
      ]}
      onPress={handlePress}
      disabled={disabled}
      activeOpacity={0.7}>
      <View style={styles.userContent}>
        <View style={styles.userImageContainer}>
          <Image
            source={
              user.avatar
                ? {uri: user.avatar}
                : require('@assets/images/default_avatar.png')
            }
            style={styles.userImage}
          />
        </View>
        <View style={styles.userInfo}>
          <Typography variant="body" style={styles.userName} numberOfLines={1}>
            {getUserName(user, t)}
          </Typography>
        </View>
      </View>
      <Animated.View
        style={[styles.selectionIndicator, {transform: [{scale: scaleAnim}]}]}>
        {isSelected ? (
          <View style={styles.checkmarkContainer}>
            <Icon name="check" size={16} color={colors.neutral.white} />
          </View>
        ) : (
          <View style={styles.uncheckedContainer} />
        )}
      </Animated.View>
    </TouchableOpacity>
  );
};

const BottomSheetContent: React.FC<BottomSheetContentProps> = ({
  users,
  selectedUsers,
  loading,
  error,
  refetch,
  loadMore,
  onSelectionChange,
  disabled,
  maxUsers,
}) => {
  const {t} = useTranslation();
  // Use state derived from props with useEffect to ensure it stays in sync
  const [localSelectedUsers, setLocalSelectedUsers] =
    useState<string[]>(selectedUsers);

  // Update local state whenever props change
  useEffect(() => {
    setLocalSelectedUsers(selectedUsers);
  }, [selectedUsers]);

  // Toggle a single user selection
  const handleLocalUserToggle = useCallback(
    (userId: string) => {
      let updatedSelection;

      if (localSelectedUsers.includes(userId)) {
        // Remove user
        updatedSelection = localSelectedUsers.filter(id => id !== userId);
      } else if (localSelectedUsers.length < maxUsers) {
        // Add user if under max limit
        updatedSelection = [...localSelectedUsers, userId];
      } else {
        return; // Don't update if max users reached
      }

      setLocalSelectedUsers(updatedSelection);
      onSelectionChange(updatedSelection);
    },
    [localSelectedUsers, onSelectionChange, maxUsers],
  );

  // Select all users up to max limit
  const handleSelectAll = useCallback(() => {
    // Only select up to maxUsers
    const usersToSelect = users.slice(0, maxUsers).map(u => u.id);
    setLocalSelectedUsers(usersToSelect);
    onSelectionChange(usersToSelect);
  }, [users, maxUsers, onSelectionChange]);

  // Clear all selections
  const handleClearAll = useCallback(() => {
    setLocalSelectedUsers([]);
    onSelectionChange([]);
  }, [onSelectionChange]);

  // Determine if we can select all (if we're under the max limit)
  const canSelectMore = localSelectedUsers.length < maxUsers;
  const allSelected =
    localSelectedUsers.length === Math.min(users.length, maxUsers);

  return (
    <View style={styles.bottomSheetContainer}>
      {loading ? (
        <View style={styles.loadingContainer}>
          <Typography variant="body" color={colors.neutral.grey}>
            {t('components.userSelector.loading_users')}
          </Typography>
        </View>
      ) : error || users.length === 0 ? (
        <View style={styles.errorContainer}>
          <Typography variant="body" color={colors.neutral.grey}>
            {error
              ? t('components.userSelector.failed_to_load')
              : t('components.userSelector.no_followed_users')}
          </Typography>
          {error && (
            <TouchableOpacity onPress={refetch} style={styles.retryButton}>
              <Typography variant="caption" color={colors.primary.main}>
                {t('components.userSelector.try_again')}
              </Typography>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <>
          {/* Add bulk selection controls */}
          <View style={styles.bulkSelectionControls}>
            <Typography variant="caption" color={colors.neutral.grey}>
              {t('components.userSelector.selected_count', {
                current: localSelectedUsers.length,
                max: maxUsers,
              })}
            </Typography>
            <View>
              {allSelected ? (
                <Button
                  title={t('common.clear_all')}
                  variant="text"
                  size="small"
                  onPress={handleClearAll}
                  disabled={localSelectedUsers.length === 0 || disabled}
                />
              ) : (
                <Button
                  title={t('common.select_all')}
                  variant="text"
                  size="small"
                  onPress={handleSelectAll}
                  disabled={!canSelectMore || disabled || users.length === 0}
                />
              )}
            </View>
          </View>

          <FlatList
            data={users}
            keyExtractor={item => item.id}
            renderItem={({item}) => (
              <UserItem
                key={item.id}
                user={item}
                isSelected={localSelectedUsers.includes(item.id)}
                onToggle={handleLocalUserToggle}
                disabled={
                  disabled ||
                  (!localSelectedUsers.includes(item.id) &&
                    localSelectedUsers.length >= maxUsers)
                }
              />
            )}
            onEndReached={loadMore}
            onEndReachedThreshold={0.5}
            extraData={localSelectedUsers}
            showsVerticalScrollIndicator={false}
          />
        </>
      )}
    </View>
  );
};

export const UserSelector: React.FC<UserSelectorProps> = ({
  selectedUsers,
  onUsersChange,
  style,
  disabled = false,
  maxUsers = 10,
}) => {
  const {t} = useTranslation();
  const {user} = useAuth();

  // Get following users - ensure we always have a valid user ID
  const {followingUsers, loading, error, loadMore, refetch} = user?.id
    ? FollowService.useFollowingUsers(user.id, 50)
    : {
        followingUsers: [],
        loading: false,
        error: null,
        loadMore: () => {},
        refetch: () => Promise.resolve(),
      };
  // Extract user objects from followingUsers
  const users: IUser[] = followingUsers
    .map(following => following.following)
    .filter((user): user is IUser => user !== undefined && user !== null);

  // Memoize the selected user details to prevent unnecessary re-renders
  // This will only recalculate when users or selectedUsers actually change
  const selectedUserDetails = useMemo(() => {
    if (users && users.length > 0 && selectedUsers.length > 0) {
      return users.filter(user => selectedUsers.includes(user.id));
    }
    return [];
  }, [users, selectedUsers]);

  // Handle the bottom sheet selection logic
  const handleShowSelector = useCallback(() => {
    openBottomSheet({
      title: t('components.userSelector.select_users'),
      content: (
        <BottomSheetContent
          users={users}
          selectedUsers={selectedUsers}
          loading={loading}
          error={error}
          refetch={refetch}
          loadMore={loadMore}
          onSelectionChange={onUsersChange}
          disabled={disabled}
          maxUsers={maxUsers}
        />
      ),
      snapPoint: 'full',
      showCloseButton: true,
      closeButtonPosition: 'top-left',
      closeOnBackdropPress: true,
    });
  }, [
    users,
    selectedUsers,
    loading,
    error,
    refetch,
    loadMore,
    onUsersChange,
    disabled,
    maxUsers,
  ]);

  if (loading) {
    return (
      <View style={[styles.container, style]}>
        <ActivityIndicator color={colors.neutral.black} />
      </View>
    );
  }

  if (error || users.length === 0) {
    return (
      <View style={[styles.container, style]}>
        <Typography variant="body" color={colors.neutral.grey}>
          {error
            ? t('components.userSelector.failed_to_load')
            : t('components.userSelector.no_followed_users')}
        </Typography>
        {error && (
          <TouchableOpacity onPress={refetch} style={styles.retryButton}>
            <Typography variant="caption">{t('common.try_again')}</Typography>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      <View style={styles.headerContainer}>
        <View style={styles.headerContent}>
          <Typography variant="body" weight="semiBold" style={styles.title}>
            {t('components.userSelector.invite_users')}
          </Typography>
          {selectedUsers.length < maxUsers && (
            <Button
              title={t('components.userSelector.add_user')}
              variant="text"
              size="small"
              iconName="plus"
              onPress={handleShowSelector}
            />
          )}
        </View>
        <Typography variant="caption" color={colors.neutral.grey}>
          {selectedUsers.length >= maxUsers
            ? t('components.userSelector.max_users_selected', {max: maxUsers})
            : t('components.userSelector.select_users_description', {
                max: maxUsers,
              })}
        </Typography>
      </View>

      {/* Selected Users with Plus Icon Chips */}
      <View style={styles.selectedSection}>
        <View style={styles.selectedChips}>
          {selectedUserDetails.map(user => (
            <Chip
              key={user.id}
              label={getUserName(user, t)}
              variant="filled"
              color="dark"
              removable={true}
              onRemove={
                !disabled
                  ? () =>
                      onUsersChange(selectedUsers.filter(id => id !== user.id))
                  : undefined
              }
              style={styles.selectedChip}
            />
          ))}

          {/* Add User Chip - only show if under max limit */}
          {selectedUsers.length === 0 && selectedUsers.length < maxUsers && (
            <Chip
              label={t('components.userSelector.add_user')}
              variant="outlined"
              color="dark"
              leadingIcon="plus"
              onPress={handleShowSelector}
            />
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  headerContainer: {
    marginBottom: spacing.md,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    marginBottom: spacing.xs,
  },
  selectedSection: {
    marginBottom: spacing.md,
  },

  selectedChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  selectedChip: {
    marginBottom: spacing.xs,
  },

  // Bottom Sheet Styles
  bottomSheetContainer: {
    maxHeight: '100%',
  },
  loadingContainer: {
    paddingVertical: spacing.xl,
    alignItems: 'center',
  },
  errorContainer: {
    paddingVertical: spacing.xl,
    alignItems: 'center',
  },

  bottomSheetFooterText: {
    paddingVertical: spacing.sm,
  },

  // Bulk selection controls
  bulkSelectionControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.secondary.main,
    marginBottom: spacing.md,
    paddingLeft: spacing.md,
  },

  // User Item Styles
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.secondary.light,
    marginBottom: spacing.sm,
    borderRadius: radius.md,
  },
  userItemSelected: {
    backgroundColor: colors.secondary.light,
  },
  userItemDisabled: {
    opacity: 0.5,
  },
  userContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  userImageContainer: {
    marginRight: spacing.sm,
  },
  userImage: {
    width: 40,
    height: 40,
    borderRadius: radius.round,
    borderWidth: 1,
    borderColor: colors.neutral.black,
  },
  userImagePlaceholder: {
    backgroundColor: colors.secondary.light,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontWeight: '500',
    marginBottom: 2,
  },
  selectionIndicator: {
    marginLeft: spacing.sm,
  },
  checkmarkContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary.main,
    justifyContent: 'center',
    alignItems: 'center',
  },
  uncheckedContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.neutral.lightGrey,
    backgroundColor: colors.neutral.white,
  },
  retryButton: {
    marginTop: spacing.sm,
    alignItems: 'center',
  },
});

export default UserSelector;
