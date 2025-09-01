import React, {useCallback, useEffect, useMemo, useState} from 'react';
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
import {useGetJoinedGroups} from '@services/group.service';
import {IGroup} from '@motorove/shared';

export interface GroupSelectorProps {
  selectedGroups: string[];
  onGroupsChange: (groupIds: string[]) => void;
  style?: ViewStyle;
  disabled?: boolean;
  maxGroups?: number;
}

interface GroupItemProps {
  group: IGroup;
  isSelected: boolean;
  onToggle: (groupId: string) => void;
  disabled?: boolean;
}

interface BottomSheetContentProps {
  groups: IGroup[];
  selectedGroups: string[];
  loading: boolean;
  error: any;
  refetch: () => void;
  loadMore: () => void;
  onSelectionChange: (selectedIds: string[]) => void;
  disabled: boolean;
  maxGroups: number;
}

const GroupItem: React.FC<GroupItemProps> = ({
  group,
  isSelected,
  onToggle,
  disabled,
}) => {
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
          <Image
            source={group.logo ? {uri: group.logo} : undefined}
            style={styles.groupImage}
          />
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
  groups,
  selectedGroups,
  loading,
  error,
  refetch,
  loadMore,
  onSelectionChange,
  disabled,
  maxGroups,
}) => {
  // Use state derived from props with useEffect to ensure it stays in sync
  const [localSelectedGroups, setLocalSelectedGroups] =
    useState<string[]>(selectedGroups);

  // Update local state whenever props change
  useEffect(() => {
    setLocalSelectedGroups(selectedGroups);
  }, [selectedGroups]);

  // Toggle a single group selection
  const handleLocalGroupToggle = useCallback(
    (groupId: string) => {
      let updatedSelection;

      if (localSelectedGroups.includes(groupId)) {
        // Remove group
        updatedSelection = localSelectedGroups.filter(id => id !== groupId);
      } else if (localSelectedGroups.length < maxGroups) {
        // Add group if under max limit
        updatedSelection = [...localSelectedGroups, groupId];
      } else {
        return; // Don't update if max groups reached
      }

      setLocalSelectedGroups(updatedSelection);
      onSelectionChange(updatedSelection);
    },
    [localSelectedGroups, onSelectionChange, maxGroups],
  );

  // Select all groups up to max limit
  const handleSelectAll = useCallback(() => {
    // Only select up to maxGroups
    const groupsToSelect = groups.slice(0, maxGroups).map(g => g.id);
    setLocalSelectedGroups(groupsToSelect);
    onSelectionChange(groupsToSelect);
  }, [groups, maxGroups, onSelectionChange]);

  // Clear all selections
  const handleClearAll = useCallback(() => {
    setLocalSelectedGroups([]);
    onSelectionChange([]);
  }, [onSelectionChange]);

  // Determine if we can select all (if we're under the max limit)
  const canSelectMore = localSelectedGroups.length < maxGroups;
  const allSelected =
    localSelectedGroups.length === Math.min(groups.length, maxGroups);

  return (
    <View style={styles.bottomSheetContainer}>
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
        <>
          {/* Add bulk selection controls */}
          <View style={styles.bulkSelectionControls}>
            <Typography variant="caption" color={colors.neutral.grey}>
              Selected: {localSelectedGroups.length}/{maxGroups}
            </Typography>
            <View>
              {allSelected ? (
                <Button
                  title="Clear All"
                  variant="text"
                  size="small"
                  onPress={handleClearAll}
                  disabled={localSelectedGroups.length === 0 || disabled}
                />
              ) : (
                <Button
                  title="Select All"
                  variant="text"
                  size="small"
                  onPress={handleSelectAll}
                  disabled={!canSelectMore || disabled || groups.length === 0}
                />
              )}
            </View>
          </View>

          <FlatList
            data={groups}
            keyExtractor={item => item.id}
            renderItem={({item}) => (
              <GroupItem
                key={item.id}
                group={item}
                isSelected={localSelectedGroups.includes(item.id)}
                onToggle={handleLocalGroupToggle}
                disabled={
                  disabled ||
                  (!localSelectedGroups.includes(item.id) &&
                    localSelectedGroups.length >= maxGroups)
                }
              />
            )}
            onEndReached={loadMore}
            onEndReachedThreshold={0.5}
            extraData={localSelectedGroups}
            showsVerticalScrollIndicator={false}
          />
        </>
      )}
    </View>
  );
};

export const GroupSelector: React.FC<GroupSelectorProps> = ({
  selectedGroups,
  onGroupsChange,
  style,
  disabled = false,
  maxGroups = 10,
}) => {
  // Initialize with role 'ADMIN' filter to only fetch admin groups
  const {groups, loading, error, refetch, loadMore} = useGetJoinedGroups();

  // Local state to handle selection
  const [localSelectedGroups, setLocalSelectedGroups] =
    useState<string[]>(selectedGroups);

  // Keep local state in sync with props
  useEffect(() => {
    setLocalSelectedGroups(selectedGroups);
  }, [selectedGroups]);

  // Handle group selection changes (from main component or bottom sheet)
  const handleSelectionChange = useCallback(
    (newSelection: string[]) => {
      setLocalSelectedGroups(newSelection);
      onGroupsChange(newSelection);
    },
    [onGroupsChange],
  );

  // Handle removing a single group
  const removeGroup = useCallback(
    (groupId: string) => {
      const updatedGroups = selectedGroups.filter(id => id !== groupId);
      handleSelectionChange(updatedGroups);
    },
    [selectedGroups, handleSelectionChange],
  );

  const selectedGroupsData = useMemo(
    () => groups.filter(group => localSelectedGroups.includes(group.id)),
    [groups, localSelectedGroups],
  );

  const openGroupSelectionSheet = useCallback(() => {
    openBottomSheet({
      content: (
        <BottomSheetContent
          groups={groups}
          selectedGroups={localSelectedGroups}
          loading={loading}
          error={error}
          refetch={refetch}
          loadMore={loadMore}
          onSelectionChange={handleSelectionChange}
          disabled={disabled}
          maxGroups={maxGroups}
        />
      ),
      snapPoint: 'full',
      title: 'Select Groups',
      showCloseButton: true,
      closeOnBackdropPress: true,
      closeButtonPosition: 'top-left',
    });
  }, [
    groups,
    localSelectedGroups,
    handleSelectionChange,
    loading,
    error,
    refetch,
    loadMore,
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
          {localSelectedGroups.length < maxGroups && (
            <Button
              title="Add Group"
              variant="text"
              size="small"
              iconName="plus"
              onPress={openGroupSelectionSheet}
            />
          )}
        </View>
        <Typography variant="caption" color={colors.neutral.grey}>
          {localSelectedGroups.length >= maxGroups
            ? `Maximum number of groups (${maxGroups}) selected`
            : `Select groups to invite to your private event (max ${maxGroups})`}
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

          {/* Add Group Chip - only show if under max limit */}
          {localSelectedGroups.length === 0 &&
            localSelectedGroups.length < maxGroups && (
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

  // Existing Group Item Styles
  groupItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.secondary.light,
    marginBottom: spacing.sm,
    borderRadius: radius.md,
  },
  groupItemSelected: {
    backgroundColor: colors.secondary.light,
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
