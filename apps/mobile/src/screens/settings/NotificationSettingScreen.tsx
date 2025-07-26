import React from 'react';
import {View, StyleSheet, ScrollView} from 'react-native';
import {useTranslation} from '@hooks/useTranslation';
import {colors, spacing, radius} from '@theme';
import {Switch, TopHeaderBar, Subtitle} from '@components';
import {
  useGetUserSetting,
  useUpdateUserSetting,
} from '@services/user-setting.service';
import {loggingService} from '@services/logging.service';
import {useNavigation} from '@react-navigation/native';
import {NotificationType} from '@motorove/shared';
import {EnumUtils} from '@utils/enumUtils';

export const NotificationSettingScreen = () => {
  const navigation = useNavigation();
  const {t} = useTranslation();
  const {userSetting, refetch} = useGetUserSetting();
  const {updateUserSetting} = useUpdateUserSetting(() => refetch());
  const [notificationPreferences, setNotificationPreferences] = React.useState<
    Record<NotificationType, boolean> | undefined
  >(userSetting?.notificationPreferences);

  const handleNotificationPreferenceChange = async (
    notificationType: NotificationType,
    value: boolean,
  ) => {
    try {
      // Optimistically update the UI
      const updatedPreferences = {
        ...notificationPreferences,
        [notificationType]: value,
      };

      setNotificationPreferences(
        updatedPreferences as Record<NotificationType, boolean>,
      );

      // Update the setting via API
      const result = await updateUserSetting({
        notificationPreferences: updatedPreferences as Record<
          NotificationType,
          boolean
        >,
      });

      if (!result?.notificationPreferences?.[notificationType] === value) {
        // Revert if the API call didn't return the expected value
        loggingService.error(
          `Failed to update notification preference for ${notificationType}`,
        );
      }
    } catch (error) {
      // Revert the optimistic update on error
      loggingService.error(
        `Error updating notification preference for ${notificationType}:`,
        error,
      );
    }
  };

  // Group notification types for better organization
  const notificationGroups = [
    {
      title: t('screens.notificationSetting.general'),
      types: [NotificationType.SYSTEM],
    },
    {
      title: t('screens.notificationSetting.posts'),
      types: [
        NotificationType.POST_LIKE,
        NotificationType.POST_COMMENT,
        NotificationType.POST_SAVE,
      ],
    },
    {
      title: t('screens.notificationSetting.social'),
      types: [
        NotificationType.USER_FOLLOW_REQUEST,
        NotificationType.USER_FOLLOW_REQUEST_ACCEPTED,
        NotificationType.NEW_FOLLOWER,
      ],
    },
    {
      title: t('screens.notificationSetting.groups'),
      types: [
        NotificationType.SHARED_POST_IN_GROUP,
        NotificationType.GROUP_JOIN_REQUEST_ACCEPTED,
        NotificationType.USER_JOINED_GROUP,
      ],
    },
    {
      title: t('screens.notificationSetting.groups_admin'),
      types: [
        NotificationType.GROUP_CHANGED_INFO,
        NotificationType.GROUP_JOIN_REQUEST,
        NotificationType.USER_LEAVE_GROUP,
        NotificationType.ADMIN_REMOVED_GROUP_MEMBER,
        NotificationType.ADMIN_CHANGED_GROUP_MEMBER_ROLE,
      ],
    },
  ];

  return (
    <View style={styles.container}>
      <TopHeaderBar
        title={t('screens.menu.notification_settings')}
        showBackButton
        onBackPress={() => navigation.goBack()}
        showShadow={false}
        containerStyle={styles.topHeaderBar}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Notification Groups */}
          {notificationGroups.map((group, _groupIndex) => (
            <View key={group.title} style={styles.groupContainer}>
              <Subtitle weight="bold" style={styles.groupTitle}>
                {group.title}
              </Subtitle>
              <View style={styles.settingsContainer}>
                {group.types.map(type => (
                  <Switch
                    key={type}
                    value={notificationPreferences?.[type]}
                    onValueChange={value =>
                      handleNotificationPreferenceChange(type, value)
                    }
                    label={EnumUtils.convertNotificationType(type)}
                    activeColor={colors.neutral.black}
                    // disabled={updating || loading}
                  />
                ))}
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.secondary.light,
  },
  topHeaderBar: {
    borderBottomWidth: 1,
    borderBottomColor: colors.secondary.main,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    padding: spacing.md,
  },
  groupContainer: {
    marginBottom: spacing.lg,
  },
  groupTitle: {
    marginBottom: spacing.sm,
  },
  settingsContainer: {
    backgroundColor: colors.neutral.white,
    borderRadius: radius.md,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
