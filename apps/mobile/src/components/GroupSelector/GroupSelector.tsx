import React, {useCallback, useMemo} from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  ViewStyle,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import {colors, spacing, radius, getShadow} from '@theme';
import {Typography, Icon, Chip, Button} from '@components';
import {openBottomSheet} from '@components/BottomSheet';
import {useGetJoinedGroups} from '@services/group.service';
import type {Group} from '@services/group.service';

export interface GroupSelectorProps {
  selectedGroups: string[];
  onGroupsChange: (groupIds: string[]) => void;
  style?: ViewStyle;
  disabled?: boolean;
  maxGroups?: number;
}

interface GroupItemProps {
  group: Group;
  isSelected: boolean;
  onToggle: (groupId: string) => void;
  disabled?: boolean;
}

interface BottomSheetContentProps {
  groups: Group[];
  selectedGroups: string[];
  loading: boolean;
  error: any;
  refetch: () => void;
  handleGroupToggle: (groupId: string) => void;
  disabled: boolean;
  maxGroups: number;
}

const GroupItem: React.FC<GroupItemProps> = ({
  group,
  isSelected,
  onToggle,
  disabled,
}) => {
  const handlePress = () => {
    if (!disabled) {
      onToggle(group.id);
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.groupItem,
        isSelected && styles.groupItemSelected,
        disabled && styles.groupItemDisabled,
      ]}
      onPress={handlePress}
      disabled={disabled}
      activeOpacity={0.7}>
      <View style={styles.groupContent}>
        <View style={styles.groupImageContainer}>
          {group.logo ? (
            <Image source={{uri: group.logo}} style={styles.groupImage} />
          ) : (
            <View style={[styles.groupImage, styles.groupImagePlaceholder]}>
              <Icon name="users" size={16} color={colors.neutral.grey} />
            </View>
          )}
        </View>
        <View style={styles.groupInfo}>
          <Typography variant="body" style={styles.groupName} numberOfLines={1}>
            {group.name}
          </Typography>
          <Typography
            variant="caption"
            color={colors.neutral.grey}
            numberOfLines={1}>
            {group.city?.value || 'No city'} • {group.memberships?.length || 0}{' '}
            members
          </Typography>
        </View>
      </View>
      <View style={styles.selectionIndicator}>
        {isSelected ? (
          <View style={styles.checkmarkContainer}>
            <Icon name="check" size={16} color={colors.neutral.white} />
          </View>
        ) : (
          <View style={styles.uncheckedContainer} />
        )}
      </View>
    </TouchableOpacity>
  );
};

const BottomSheetContent: React.FC<BottomSheetContentProps> = ({
  groups,
  selectedGroups,
  loading,
  error,
  refetch,
  handleGroupToggle,
  disabled,
  maxGroups,
}) => (
  <View>
    {loading ? (
      <View style={styles.loadingContainer}>
        <Typography variant="body" color={colors.neutral.grey}>
          Loading your groups...
        </Typography>
      </View>
    ) : error || groups.length === 0 ? (
      <View style={styles.errorContainer}>
        <Typography variant="body" color={colors.neutral.grey}>
          {error
            ? 'Failed to load groups'
            : "You haven't joined any groups yet"}
        </Typography>
        {error && (
          <TouchableOpacity onPress={refetch} style={styles.retryButton}>
            <Typography variant="caption" color={colors.primary.main}>
              Try again
            </Typography>
          </TouchableOpacity>
        )}
      </View>
    ) : (
      <FlatList
        data={groups}
        keyExtractor={item => item.id}
        renderItem={({item}) => (
          <GroupItem
            key={item.id}
            group={item}
            isSelected={selectedGroups.includes(item.id)}
            onToggle={handleGroupToggle}
            disabled={
              disabled ||
              (!selectedGroups.includes(item.id) &&
                selectedGroups.length >= maxGroups)
            }
          />
        )}
        extraData={selectedGroups}
        showsVerticalScrollIndicator={false}
      />
    )}
  </View>
);

export const GroupSelector: React.FC<GroupSelectorProps> = ({
  selectedGroups,
  onGroupsChange,
  style,
  disabled = false,
  maxGroups = 10,
}) => {
  const {groups, loading, error, refetch} = useGetJoinedGroups();

  const handleGroupToggle = useCallback(
    (groupId: string) => {
      if (selectedGroups.includes(groupId)) {
        // Remove group
        onGroupsChange(selectedGroups.filter(id => id !== groupId));
      } else {
        // Add group (check max limit)
        if (selectedGroups.length < maxGroups) {
          onGroupsChange([...selectedGroups, groupId]);
        }
      }
    },
    [selectedGroups, onGroupsChange, maxGroups],
  );

  const removeGroup = useCallback(
    (groupId: string) => {
      onGroupsChange(selectedGroups.filter(id => id !== groupId));
    },
    [selectedGroups, onGroupsChange],
  );

  const selectedGroupsData = useMemo(
    () => groups.filter(group => selectedGroups.includes(group.id)),
    [groups, selectedGroups],
  );

  const openGroupSelectionSheet = useCallback(() => {
    openBottomSheet({
      content: (
        <BottomSheetContent
          groups={groups}
          selectedGroups={selectedGroups}
          loading={loading}
          error={error}
          refetch={refetch}
          handleGroupToggle={handleGroupToggle}
          disabled={disabled}
          maxGroups={maxGroups}
        />
      ),
      footer: (
        <Typography
          variant="caption"
          align="center"
          color={colors.neutral.grey}
          style={styles.bottomSheetFooterText}>
          Selected: {selectedGroups.length}/{maxGroups} groups
        </Typography>
      ),
      snapPoint: 'partial',
      title: 'Invite Groups',
      showCloseButton: true,
      closeOnBackdropPress: true,
      closeButtonPosition: 'top-left',
      enableGestureControl: false,
    });
  }, [
    groups,
    selectedGroups,
    handleGroupToggle,
    loading,
    error,
    refetch,
    disabled,
    maxGroups,
  ]);

  if (loading) {
    return (
      <View style={[styles.container, style]}>
        <ActivityIndicator color={colors.neutral.black} />
      </View>
    );
  }

  if (error || groups.length === 0) {
    return (
      <View style={[styles.container, style]}>
        <Typography variant="body" color={colors.neutral.grey}>
          {error
            ? 'Failed to load groups'
            : "You haven't joined any groups yet"}
        </Typography>
        {error && (
          <TouchableOpacity onPress={refetch} style={styles.retryButton}>
            <Typography variant="caption">Try again</Typography>
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
            Invite Groups
          </Typography>
          <Button
            title="Add Group"
            variant="text"
            size="small"
            iconName="plus"
            onPress={openGroupSelectionSheet}
          />
        </View>
        <Typography variant="caption" color={colors.neutral.grey}>
          Select groups to invite to your private event (max {maxGroups})
        </Typography>
      </View>

      {/* Selected Groups with Plus Icon Chips */}
      <View style={styles.selectedSection}>
        <View style={styles.selectedChips}>
          {selectedGroupsData.map(group => (
            <Chip
              key={group.id}
              label={group.name}
              variant="filled"
              color="dark"
              removable={true}
              onRemove={!disabled ? () => removeGroup(group.id) : undefined}
              style={styles.selectedChip}
            />
          ))}

          {/* Add Group Chip */}
          {selectedGroups.length === 0 && (
            <Chip
              label="Add Group"
              variant="outlined"
              color="dark"
              leadingIcon="plus"
              onPress={openGroupSelectionSheet}
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
  // Existing Group Item Styles
  groupItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.secondary.light,
    marginBottom: spacing.sm,
  },
  groupItemSelected: {
    borderColor: colors.primary.light,
  },
  groupItemDisabled: {
    opacity: 0.5,
  },
  groupContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  groupImageContainer: {
    marginRight: spacing.sm,
  },
  groupImage: {
    width: 40,
    height: 40,
    borderRadius: radius.round,
  },
  groupImagePlaceholder: {
    backgroundColor: colors.secondary.light,
    justifyContent: 'center',
    alignItems: 'center',
  },
  groupInfo: {
    flex: 1,
  },
  groupName: {
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
    ...getShadow('small'),
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

export default GroupSelector;
