import React, {useState} from 'react';
import {View, StyleSheet, ScrollView} from 'react-native';
import {useTranslation} from '@hooks/useTranslation';
import {colors, spacing, radius, getShadow, commonStyles} from '@theme';
import {Switch, TopHeaderBar, Body, BodySmall} from '@components';
import {useUpdateUserSetting} from '@services/user-setting.service';
// import {useAuth} from '@contexts/AuthContext';
import {loggingService} from '@services/logging.service';
import {useNavigation} from '@react-navigation/native';

export const PrivacySettingScreen = () => {
  const navigation = useNavigation();
  const {t} = useTranslation();
  //   const {user} = useAuth();
  const {updateUserSetting, loading} = useUpdateUserSetting();

  // Local state for the auto accept followers setting
  const [autoAcceptFollowers, setAutoAcceptFollowers] =
    useState<boolean>(false);

  // Initialize the setting from user data when component mounts
  //   useEffect(() => {
  //     if (user?.userSetting?.autoAcceptFollowers !== undefined) {
  //       setAutoAcceptFollowers(user.userSetting.autoAcceptFollowers);
  //     }
  //   }, [user?.userSetting?.autoAcceptFollowers]);

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
        title={t('screens.privacySetting.title')}
        showBackButton
        onBackPress={() => navigation.goBack()}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.headerContainer}>
            <Body weight="bold" style={styles.headerTitle}>
              {t('screens.privacySetting.header_title')}
            </Body>
            <BodySmall
              color={colors.neutral.grey}
              style={styles.headerDescription}>
              {t('screens.privacySetting.header_description')}
            </BodySmall>
          </View>

          {/* Settings Section */}
          <View style={styles.settingsContainer}>
            <Switch
              value={autoAcceptFollowers}
              onValueChange={handleAutoAcceptFollowersChange}
              disabled={loading}
              label={t('screens.privacySetting.auto_accept_followers_label')}
              description={t(
                'screens.privacySetting.auto_accept_followers_description',
              )}
              activeColor={colors.neutral.black}
              style={styles.switchItem}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...commonStyles.container,
    backgroundColor: colors.secondary.light,
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
  settingsContainer: {
    backgroundColor: colors.neutral.white,
    borderRadius: radius.md,
    ...getShadow('small'),
  },
  switchItem: {
    marginBottom: 0,
  },
});
