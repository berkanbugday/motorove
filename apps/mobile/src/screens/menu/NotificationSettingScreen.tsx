import React, {useEffect} from 'react';
import {View, StyleSheet, ScrollView} from 'react-native';
import {useTranslation} from '@hooks/useTranslation';
import {colors, spacing, radius} from '@theme';
import {useNotificationPermission} from '@hooks/useNotificationPermission';
import {Switch, TopHeaderBar, Subtitle, Button, BodySmall} from '@components';
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
  const {isGranted, openSettings} = useNotificationPermission();
  const {userSetting, refetch} = useGetUserSetting();
  const {updateUserSetting} = useUpdateUserSetting(() => refetch());
  const [notificationPreferences, setNotificationPreferences] = React.useState<
    Record<NotificationType, boolean> | undefined
  >();

  useEffect(() => {
    if (userSetting) {
      setNotificationPreferences(userSetting.notificationPreferences);
    }
  }, [userSetting]);

  const handleNotificationPreferenceChange = async (
    updatedPreferences: Record<NotificationType, boolean>,
  ) => {
    try {
      // Update the setting via API
      const result = await updateUserSetting({
        notificationPreferences: updatedPreferences,
      });

      if (!result?.notificationPreferences) {
        // Revert if the API call didn't return the expected value
        loggingService.error('Failed to update notification preference');
      }
    } catch (error) {
      // Revert the optimistic update on error
      loggingService.error('Error updating notification preference:', error);
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
    {
      title: t('screens.notificationSetting.events'),
      types: [
        NotificationType.EVENT_INVITATION,
        NotificationType.EVENT_INVITATION_REMINDER,
        NotificationType.EVENT_REMINDER,
        NotificationType.EVENT_CANCELLED,
        NotificationType.EVENT_UPDATED,
      ],
    },
    {
      title: t('screens.notificationSetting.warnings'),
      types: [NotificationType.WARNING],
    },
    {
      title: t('screens.notificationSetting.emergencies'),
      types: [NotificationType.EMERGENCY],
    },
  ];

  // Render different UI based on permission status
  const renderPermissionRequired = () => {
    return (
      <View style={styles.permissionContainer}>
        <BodySmall align="center" color={colors.neutral.grey}>
          {t('screens.notificationSetting.permission_description')}
        </BodySmall>
        <Button
          variant="text"
          size="small"
          textStyle={{color: colors.primary.main}}
          onPress={openSettings}
          title={t('screens.notificationSetting.open_settings')}
        />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <TopHeaderBar
        title={t('screens.menu.notification_settings')}
        showBackButton
        onBackPress={() => navigation.goBack()}
        showShadow={false}
        containerStyle={styles.topHeaderBar}
        dropdownMenuIcon={isGranted ? 'more-horizontal' : undefined}
        dropdownMenuItems={
          isGranted
            ? [
                {
                  label: t('screens.notificationSetting.enable_all'),
                },
              ]
            : []
        }
        onDropdownItemSelect={() => {
          const updatedPreferences = {} as Record<NotificationType, boolean>;

          notificationGroups?.map(group => {
            group.types.map(type => {
              updatedPreferences[type] = true;
            });
          });

          setNotificationPreferences(updatedPreferences);

          handleNotificationPreferenceChange(updatedPreferences);
        }}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {!isGranted && renderPermissionRequired()}
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
                    disabled={!isGranted}
                    onValueChange={value => {
                      const updatedPreferences = {
                        ...notificationPreferences,
                        [type]: value,
                      } as Record<NotificationType, boolean>;
                      setNotificationPreferences(updatedPreferences);

                      handleNotificationPreferenceChange(updatedPreferences);
                    }}
                    label={EnumUtils.convertNotificationType(type)}
                    activeColor={colors.neutral.black}
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
    borderRadius: radius.sm,
  },
  // Permission screen styles
  permissionContainer: {
    flex: 1,
    backgroundColor: colors.neutral.white,
    borderRadius: radius.sm,
    padding: spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
});
