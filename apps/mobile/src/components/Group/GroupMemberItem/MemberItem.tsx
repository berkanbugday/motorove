import React, {useState, useCallback, useRef} from 'react';
import {
  View,
  StyleSheet,
  Image,
  TouchableOpacity,
  Animated,
} from 'react-native';
import {colors, spacing} from '@theme';
import {MainScreenNavigationProp} from '@navigation/types/navigationTypes';
import {GroupMemberRole} from '@motorove/shared';
import {AuthUser} from '@app-types/auth.types';
import {Chip, Button, Caption, Typography} from '@components';
import {navigateToScreen} from '@navigation/utils/navigationHelpers';
import {useTranslation} from '@hooks/useTranslation';

type MemberItemProps = {
  item: any;
  isAdmin?: boolean;
  isMember?: boolean;
  user: AuthUser;
  navigation?: MainScreenNavigationProp<'GroupDetail'>;
  onChangeRole?: (member: any) => void;
  onRemoveMember?: (member: any) => void;
};

export const MemberItem = React.memo(
  ({
    item,
    isAdmin,
    isMember,
    user,
    navigation,
    onChangeRole,
    onRemoveMember,
  }: MemberItemProps) => {
    const {t} = useTranslation();
    const [isActive, setIsActive] = useState(false);
    const actionAnimValue = useRef(new Animated.Value(-100)).current;
    const profileAnimValue = useRef(new Animated.Value(0)).current;

    const animateActions = useCallback(
      (show: boolean) => {
        Animated.spring(actionAnimValue, {
          toValue: show ? 0 : -100,
          useNativeDriver: true,
          friction: 8,
          tension: 40,
        }).start();

        Animated.spring(profileAnimValue, {
          toValue: show ? 100 : 0,
          useNativeDriver: true,
          friction: 8,
          tension: 40,
        }).start();
      },
      [actionAnimValue, profileAnimValue],
    );

    const handlePress = useCallback(() => {
      if (isAdmin) {
        const newState = !isActive;
        setIsActive(newState);
        animateActions(newState);

        // Auto-hide after 3 seconds if showing
        if (newState) {
          setTimeout(() => {
            setIsActive(false);
            animateActions(false);
          }, 3000);
        }
      }
    }, [isActive, isAdmin, animateActions]);

    return (
      <TouchableOpacity
        style={styles.memberItem}
        onPress={handlePress}
        activeOpacity={0.8}>
        <View style={styles.memberLeftContent}>
          <Image
            source={
              item.user.avatar
                ? {uri: item.user.avatar}
                : require('@assets/images/default_avatar.png')
            }
            style={styles.memberAvatar}
          />
          <View style={styles.memberInfo}>
            <Typography weight="medium">
              {item.user.firstName} {item.user.lastName}
            </Typography>
            <View style={styles.memberRoleContainer}>
              {item.role === GroupMemberRole.ADMIN && (
                <Chip
                  variant="filled"
                  color="primary"
                  size="small"
                  label={t('enums.groupMemberRole.admin')}
                  style={styles.adminRole}
                />
              )}

              {item.role === GroupMemberRole.MEMBER && (
                <Chip
                  variant="filled"
                  color="secondary"
                  size="small"
                  label={t('enums.groupMemberRole.member')}
                  style={styles.memberRole}
                />
              )}
              <Caption color={colors.neutral.grey}>
                {item.user.city?.value}
              </Caption>
            </View>
          </View>
        </View>
        {isAdmin && item.user.id !== user.id && (
          <Animated.View
            style={[
              styles.memberRightContent,
              {
                position: 'absolute',
                right: 0,
                transform: [{translateX: actionAnimValue}],
                opacity: actionAnimValue.interpolate({
                  inputRange: [-100, 0],
                  outputRange: [0, 1],
                }),
                display: isActive ? 'flex' : 'none',
              },
            ]}>
            <Button
              iconName="user-gear-filled"
              iconSize={24}
              variant="secondary"
              shape="circle"
              onPress={() => onChangeRole && onChangeRole(item)}
              style={styles.memberAction}
            />
            <Button
              iconName="user-slash-filled"
              iconSize={24}
              variant="primary"
              shape="circle"
              onPress={() => onRemoveMember && onRemoveMember(item)}
              style={styles.memberAction}
            />
          </Animated.View>
        )}
        {isMember && item.user.id !== user.id && (
          <Animated.View
            style={[
              {
                position: 'absolute',
                right: 0,
                transform: [{translateX: profileAnimValue}],
                opacity: profileAnimValue.interpolate({
                  inputRange: [0, 100],
                  outputRange: [1, 0],
                }),
                display: isActive ? 'none' : 'flex',
              },
            ]}>
            <Button
              title={t('screens.group.view_profile')}
              variant="outline"
              shape="round"
              size="small"
              onPress={() => {
                if (item.user.id !== user.id && navigation) {
                  navigateToScreen(navigation, 'Profile', {
                    userId: item.user.id,
                  });
                }
              }}
            />
          </Animated.View>
        )}
      </TouchableOpacity>
    );
  },
);

MemberItem.displayName = 'MemberItem';

const styles = StyleSheet.create({
  memberItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.secondary.light,
  },
  memberLeftContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  memberAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.neutral.black,
    marginRight: spacing.sm,
  },
  memberInfo: {
    justifyContent: 'center',
  },
  memberRoleContainer: {
    width: 180,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: spacing.sm,
  },
  adminRole: {
    backgroundColor: colors.primary.light,
  },
  memberRole: {
    backgroundColor: colors.secondary.light,
  },
  memberRightContent: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  memberAction: {
    width: spacing.xxl,
    height: spacing.xxl,
  },
});
