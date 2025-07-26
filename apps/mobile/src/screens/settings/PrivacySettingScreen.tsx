import React, {useState} from 'react';
import {View, StyleSheet, ScrollView} from 'react-native';
import {useTranslation} from '@hooks/useTranslation';
import {colors, spacing, radius, getShadow, commonStyles} from '@theme';
import {Switch, TopHeaderBar, Body, BodySmall} from '@components';
import {
  useGetUserSetting,
  useUpdateUserSetting,
} from '@services/user-setting.service';
// import {useAuth} from '@contexts/AuthContext';
import {loggingService} from '@services/logging.service';
import {useNavigation} from '@react-navigation/native';

export const PrivacySettingScreen = () => {
  const navigation = useNavigation();
  const {t} = useTranslation();
  const {userSetting, refetch} = useGetUserSetting();
  const {updateUserSetting} = useUpdateUserSetting(() => refetch());

  // Local state for the auto accept followers setting
  const [autoAcceptFollowers, setAutoAcceptFollowers] = useState<boolean>(
    userSetting?.autoAcceptFollowers,
  );

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
        title={t('screens.menu.privacy_settings')}
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
              label={t('screens.privacySetting.auto_accept_followers_label')}
              description={t(
                'screens.privacySetting.auto_accept_followers_description',
              )}
              activeColor={colors.neutral.black}
            />
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
});
