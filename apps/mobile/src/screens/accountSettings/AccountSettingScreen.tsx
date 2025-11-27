import React, {useEffect, useState} from 'react';
import {View, StyleSheet, ScrollView, TouchableOpacity} from 'react-native';
import {useTranslation} from '@hooks/useTranslation';
import {colors, spacing, radius} from '@theme';
import {Switch, TopHeaderBar, Body, Icon} from '@components';
import {
  useGetUserSetting,
  useUpdateUserSetting,
} from '@services/user-setting.service';
// import {useAuth} from '@contexts/AuthContext';
import {loggingService} from '@services/logging.service';
import {useNavigation} from '@react-navigation/native';
import {navigateToScreen} from '@navigation/utils/navigationHelpers';
import {MainScreenNavigationProp} from '@navigation/types/navigationTypes';

export const AccountSettingScreen = () => {
  const navigation =
    useNavigation<MainScreenNavigationProp<'AccountSetting'>>();
  const {t} = useTranslation();
  const {userSetting, refetch} = useGetUserSetting();
  const {updateUserSetting} = useUpdateUserSetting(() => refetch());

  // Local state for the auto accept followers setting
  const [autoAcceptFollowers, setAutoAcceptFollowers] = useState<boolean>();

  useEffect(() => {
    if (userSetting) {
      setAutoAcceptFollowers(userSetting.autoAcceptFollowers);
    }
  }, [userSetting]);

  const handleAutoAcceptFollowersChange = async (value: boolean) => {
    try {
      // Optimistically update the UI
      setAutoAcceptFollowers(value);

      // Update the setting via API
      const result = await updateUserSetting({
        autoAcceptFollowers: value,
      });

      if (result?.autoAcceptFollowers !== value) {
        // Revert if the API call didn't return the expected value
        setAutoAcceptFollowers(!value);
        loggingService.error('Failed to update auto accept followers setting');
      }
    } catch (error) {
      // Revert the optimistic update on error
      setAutoAcceptFollowers(!value);
      loggingService.error(
        'Error updating auto accept followers setting:',
        error,
      );
    }
  };

  return (
    <View style={styles.container}>
      <TopHeaderBar
        title={t('screens.menu.account_settings')}
        showBackButton
        onBackPress={() => navigation.goBack()}
        showShadow={false}
        containerStyle={styles.topHeaderBar}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Settings Section */}
          <View style={styles.settingsContainer}>
            <Switch
              value={autoAcceptFollowers}
              onValueChange={handleAutoAcceptFollowersChange}
              label={t('screens.accountSetting.auto_accept_followers_label')}
              description={t(
                'screens.accountSetting.auto_accept_followers_description',
              )}
              activeColor={colors.neutral.black}
            />
          </View>

          {/* Menu Items */}
          <View style={styles.menuContainer}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                // Navigate to change email screen or handle action
                navigateToScreen(navigation, 'BlockedUser');
              }}>
              <View style={styles.menuItemContent}>
                <Icon
                  name="user-slash-filled"
                  size={18}
                  color={colors.neutral.black}
                />
                <Body style={styles.menuItemText}>
                  {t('screens.blockedUser.blocked_users')}
                </Body>
              </View>
              <View style={styles.menuItemRight}>
                <Icon name="chevron-right" size={18} />
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                // Navigate to change email screen or handle action
                navigateToScreen(navigation, 'ChangeEmail');
              }}>
              <View style={styles.menuItemContent}>
                <Icon
                  name="envelope-filled"
                  size={18}
                  color={colors.neutral.black}
                />
                <Body style={styles.menuItemText}>
                  {t('screens.changeEmail.title')}
                </Body>
              </View>
              <View style={styles.menuItemRight}>
                <Icon name="chevron-right" size={18} />
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.menuItem, {borderBottomWidth: 0}]}
              onPress={() => {
                // Navigate to change password screen or handle action
                navigateToScreen(navigation, 'ChangePassword');
              }}>
              <View style={styles.menuItemContent}>
                <Icon
                  name="lock-filled"
                  size={18}
                  color={colors.neutral.black}
                />
                <Body style={styles.menuItemText}>
                  {t('screens.changePassword.title')}
                </Body>
              </View>
              <View style={styles.menuItemRight}>
                <Icon name="chevron-right" size={18} />
              </View>
            </TouchableOpacity>
          </View>
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
    gap: spacing.md,
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
  menuContainer: {
    backgroundColor: colors.neutral.white,
    borderRadius: radius.sm,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.secondary.main,
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemText: {
    marginLeft: spacing.md,
  },
  menuItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
