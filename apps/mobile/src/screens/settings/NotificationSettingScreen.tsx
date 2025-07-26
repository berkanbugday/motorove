import React from 'react';
import {View, StyleSheet, ScrollView} from 'react-native';
import {useTranslation} from '@hooks/useTranslation';
import {colors, spacing, radius} from '@theme';
import {Switch, TopHeaderBar, Body, BodySmall} from '@components';
import {
  useGetUserSetting,
  useUpdateUserSetting,
} from '@services/user-setting.service';
import {loggingService} from '@services/logging.service';
import {useNavigation} from '@react-navigation/native';
import {NotificationType} from '@motorove/shared';

export const NotificationSettingScreen = () => {
  const navigation = useNavigation();
  const {t} = useTranslation();
  const {userSetting, loading} = useGetUserSetting();
  const {updateUserSetting} = useUpdateUserSetting();

  const handleNotificationPreferenceChange = async (
    notificationType: NotificationType,
    value: boolean,
  ) => {
    try {
      // Optimistically update the UI
      const updatedPreferences = {
        ...userSetting?.notificationPreferences,
        [notificationType]: value,
      };
      setNotificationPreferences(updatedPreferences);

      // Update the setting via API
      const result = await updateUserSetting({
        notificationPreferences: updatedPreferences,
      });

      if (!result?.notificationPreferences?.[notificationType] === value) {
        // Revert if the API call didn't return the expected value
        setNotificationPreferences(prev => ({
          ...prev,
          [notificationType]: !value,
        }));
        loggingService.error(
          `Failed to update notification preference for ${notificationType}`,
        );
      }
    } catch (error) {
      // Revert the optimistic update on error
      setNotificationPreferences(prev => ({
        ...prev,
        [notificationType]: !value,
      }));
      loggingService.error(
        `Error updating notification preference for ${notificationType}:`,
        error,
      );
    }
  };

  // Group notification types for better organization
  const notificationGroups = [
    {
      title: t('screens.notificationSetting.groups.general'),
      types: [NotificationType.SYSTEM, NotificationType.NEW_MESSAGE],
    },
    {
      title: t('screens.notificationSetting.groups.social'),
      types: [NotificationType.FRIEND_REQUEST],
    },
    {
      title: t('screens.notificationSetting.groups.groups'),
      types: [
        NotificationType.GROUP_INVITE,
        NotificationType.GROUP_JOIN,
        NotificationType.GROUP_LEAVE,
        NotificationType.GROUP_MEMBERSHIP_STATUS_UPDATED,
        NotificationType.GROUP_MEMBERSHIP_ROLE_UPDATED,
        NotificationType.GROUP_MEMBERSHIP_REMOVED,
        NotificationType.GROUP_MEMBERSHIP_ADDED,
        NotificationType.GROUP_MEMBERSHIP_REQUEST,
        NotificationType.GROUP_MEMBERSHIP_REQUEST_ACCEPTED,
        NotificationType.GROUP_MEMBERSHIP_REQUEST_REJECTED,
      ],
    },
    {
      title: t('screens.notificationSetting.groups.rides'),
      types: [
        NotificationType.RIDE_INVITATION,
        NotificationType.RIDE_STARTED,
        NotificationType.RIDE_COMPLETED,
      ],
    },
    {
      title: t('screens.notificationSetting.groups.events'),
      types: [
        NotificationType.EVENT_INVITATION,
        NotificationType.EVENT_REMINDER,
      ],
    },
    {
      title: t('screens.notificationSetting.groups.maintenance'),
      types: [NotificationType.MAINTENANCE_REMINDER],
    },
  ];

  return (
    <View style={styles.container}>
      <TopHeaderBar
        title={t('screens.notificationSetting.title')}
        showBackButton
        onBackPress={() => navigation.goBack()}
        showShadow={false}
        containerStyle={styles.topHeaderBar}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.headerContainer}>
            <Body weight="bold" style={styles.headerTitle}>
              {t('screens.notificationSetting.header_title')}
            </Body>
            <BodySmall
              color={colors.neutral.grey}
              style={styles.headerDescription}>
              {t('screens.notificationSetting.header_description')}
            </BodySmall>
          </View>

          {/* Notification Groups */}
          {notificationGroups.map((group, _groupIndex) => (
            <View key={group.title} style={styles.groupContainer}>
              <Body weight="semiBold" style={styles.groupTitle}>
                {group.title}
              </Body>
              <View style={styles.settingsContainer}>
                {group.types.map((type, typeIndex) => (
                  <Switch
                    key={type}
                    value={notificationPreferences[type]}
                    onValueChange={value =>
                      handleNotificationPreferenceChange(type, value)
                    }
                    disabled={loading}
                    label={getNotificationTypeLabel(type)}
                    description={getNotificationTypeDescription(type)}
                    activeColor={colors.neutral.black}
                    style={{
                      ...styles.switchItem,
                      ...(typeIndex === group.types.length - 1 &&
                        styles.lastSwitchItem),
                    }}
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
  headerContainer: {
    marginBottom: spacing.lg,
    paddingVertical: spacing.sm,
  },
  headerTitle: {
    marginBottom: spacing.xs,
  },
  headerDescription: {
    lineHeight: 20,
  },
  groupContainer: {
    marginBottom: spacing.lg,
  },
  groupTitle: {
    marginBottom: spacing.sm,
    color: colors.neutral.darkGrey,
  },
  settingsContainer: {
    backgroundColor: colors.neutral.white,
    borderRadius: radius.md,
  },
  switchItem: {
    marginBottom: 0,
  },
  lastSwitchItem: {
    borderBottomWidth: 0,
  },
});
