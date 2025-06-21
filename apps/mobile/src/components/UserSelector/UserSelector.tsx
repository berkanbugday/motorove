import React, {useState, useEffect} from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Image,
} from 'react-native';
import {Typography, Chip, Icon} from '@components';
import {colors, radius, spacing} from '@theme';
import {userService} from '@services/user.service';

type User = {
  id: string;
  firstName?: string | null;
  lastName?: string | null;
  avatar?: string | null;
};

interface UserSelectorProps {
  selectedUsers: string[];
  onUsersChange: (userIds: string[]) => void;
  maxUsers?: number;
  showSelectedCount?: boolean;
}

export const UserSelector: React.FC<UserSelectorProps> = ({
  selectedUsers,
  onUsersChange,
  maxUsers = 10,
  showSelectedCount = true,
}) => {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        // Fetch followed users - we're inviting people we follow
        const followingUsers = await userService.getMyFollowing();
        setUsers(followingUsers);
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const toggleUserSelection = (userId: string) => {
    if (selectedUsers.includes(userId)) {
      // Remove user from selection
      onUsersChange(selectedUsers.filter(id => id !== userId));
    } else if (selectedUsers.length < maxUsers) {
      // Add user to selection if under max
      onUsersChange([...selectedUsers, userId]);
    }
  };

  const getUserName = (user: User): string => {
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    if (user.firstName) {
      return user.firstName;
    }
    return 'Unknown User';
  };

  if (loading) {
    return <ActivityIndicator size="small" color={colors.primary.main} />;
  }

  if (users.length === 0) {
    return (
      <View style={styles.emptyState}>
        <Typography variant="body" color={colors.neutral.grey}>
          You don't follow any users yet.
        </Typography>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {showSelectedCount && (
        <View style={styles.header}>
          <Typography variant="body" color={colors.neutral.darkGrey}>
            Selected Users: {selectedUsers.length}/{maxUsers}
          </Typography>
        </View>
      )}

      <FlatList
        data={users}
        keyExtractor={item => item.id}
        renderItem={({item}) => (
          <TouchableOpacity
            style={styles.userItem}
            onPress={() => toggleUserSelection(item.id)}
            activeOpacity={0.7}>
            <View style={styles.userInfo}>
              {item.avatar ? (
                <Image source={{uri: item.avatar}} style={styles.userAvatar} />
              ) : (
                <View
                  style={[
                    styles.userAvatar,
                    {backgroundColor: colors.secondary.light},
                  ]}>
                  <Icon name="user" size={16} color={colors.neutral.grey} />
                </View>
              )}
              <Typography variant="body">{getUserName(item)}</Typography>
            </View>

            <View style={styles.chipContainer}>
              {selectedUsers.includes(item.id) ? (
                <View
                  style={[
                    styles.checkbox,
                    {backgroundColor: colors.primary.main},
                  ]}>
                  <Icon name="check" size={14} color={colors.neutral.white} />
                </View>
              ) : (
                <View style={styles.checkbox} />
              )}
            </View>
          </TouchableOpacity>
        )}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />

      {selectedUsers.length > 0 && (
        <View style={styles.selectedUsersContainer}>
          <Typography variant="bodySmall" color={colors.neutral.darkGrey}>
            Selected Users:
          </Typography>
          <View style={styles.chipsContainer}>
            {selectedUsers.map(userId => {
              const user = users.find(u => u.id === userId);
              if (!user) {
                return null;
              }
              return (
                <Chip
                  key={userId}
                  label={getUserName(user)}
                  onRemove={() => toggleUserSelection(userId)}
                  style={styles.chip}
                />
              );
            })}
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  header: {
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.xs,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.secondary.light,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chipContainer: {
    flexDirection: 'row',
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: radius.xs,
    borderWidth: 1,
    borderColor: colors.neutral.grey,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  listContent: {
    paddingBottom: spacing.sm,
  },
  selectedUsersContainer: {
    marginTop: spacing.md,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: spacing.xs,
  },
  chip: {
    marginRight: spacing.xs,
    marginBottom: spacing.xs,
  },
});

export default UserSelector;
