import React from 'react';
import {View, StyleSheet, ScrollView} from 'react-native';
import {useTranslation} from '@hooks/useTranslation';
import {colors, spacing, rs, radius, getShadow} from '@theme';
import {Icon, Body, BodySmall, Caption, Subtitle, Button} from '@components';
import LottieView from 'lottie-react-native';
import {useUpdateNotificationPermission} from '@services/user.service';
import {NotificationPermission} from '@motorove/shared';
import {useAuth} from '@contexts/AuthContext';

export const NotificationPermissionScreen = () => {
  const {t} = useTranslation();
  const {updateNotificationPermission} = useUpdateNotificationPermission();
  const {updateNotificationPermission: updateNotificationPermissionAuth} =
    useAuth();

  const handleAllow = async () => {
    const result = await updateNotificationPermission(
      NotificationPermission.ALLOWED,
    );
    if (result) {
      await updateNotificationPermissionAuth(NotificationPermission.ALLOWED);
    }
  };

  const handleNotAllow = async () => {
    const result = await updateNotificationPermission(
      NotificationPermission.BLOCKED,
    );
    if (result) {
      await updateNotificationPermissionAuth(NotificationPermission.BLOCKED);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <View style={styles.container}>
        {/* Hero Image */}
        <View style={styles.imageContainer}>
          <LottieView
            source={require('../../assets/lottie/notification_permission.json')}
            style={styles.heroImage}
            autoPlay
            renderMode="SOFTWARE"
          />
        </View>

        {/* Content */}
        <Subtitle weight="bold" align="center" style={styles.title}>
          {t('screens.notificationPermission.title')}
        </Subtitle>
        <BodySmall align="center" style={styles.description}>
          {t('screens.notificationPermission.description')}
        </BodySmall>

        {/* Features */}
        <View style={styles.featuresContainer}>
          <FeatureItem
            icon="bell-filled"
            title={t('screens.notificationPermission.event_title')}
            text={t('screens.notificationPermission.events')}
          />
          <FeatureItem
            icon="comments-filled"
            title={t('screens.notificationPermission.comment_title')}
            text={t('screens.notificationPermission.comments')}
          />
          <FeatureItem
            icon="users-filled"
            title={t('screens.notificationPermission.group_title')}
            text={t('screens.notificationPermission.groups')}
          />
        </View>

        {/* Buttons */}
        <Button
          title={t('screens.notificationPermission.allow_notifications')}
          variant="primary"
          shape="round"
          onPress={handleAllow}
          style={styles.allowButton}
        />

        <Button
          title={t('screens.notificationPermission.not_allow')}
          variant="outline"
          shape="round"
          onPress={handleNotAllow}
          style={styles.laterButton}
        />

        {/* Footer */}
        <Caption color={colors.neutral.grey} style={styles.footerText}>
          {t('screens.notificationPermission.footer_text')}
        </Caption>
      </View>
    </ScrollView>
  );
};

interface FeatureItemProps {
  icon:
    | 'bell'
    | 'bell-filled'
    | 'bell-exclamation'
    | 'bell-exclamation-filled'
    | 'comments'
    | 'comments-filled'
    | 'route'
    | 'route-filled'
    | 'users'
    | 'users-filled';
  title: string;
  text: string;
}

function FeatureItem({icon, title, text}: FeatureItemProps) {
  return (
    <View style={styles.featureItem}>
      <View style={styles.featureIconContainer}>
        <Icon name={icon} size={24} />
      </View>
      <View style={styles.featureTextContainer}>
        <Body weight="bold">{title}</Body>
        <BodySmall color={colors.neutral.darkGrey}>{text}</BodySmall>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.neutral.white,
    minHeight: '100%',
  },
  container: {
    padding: spacing.md,
    alignItems: 'center',
    backgroundColor: colors.neutral.white,
    maxWidth: 400,
    width: '100%',
    borderRadius: rs(16),
    overflow: 'hidden',
  },
  imageContainer: {
    width: 80,
    height: 80,
    marginVertical: spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  title: {
    marginBottom: spacing.md,
  },
  description: {
    marginBottom: spacing.md,
  },
  featuresContainer: {
    width: '100%',
    marginBottom: spacing.md,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginVertical: spacing.sm,
    backgroundColor: colors.secondary.light,
    padding: spacing.sm,
    borderRadius: radius.sm,
    ...getShadow('small'),
  },
  featureIconContainer: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureTextContainer: {
    flex: 1,
  },
  allowButton: {
    width: '100%',
    marginBottom: spacing.md,
  },
  laterButton: {
    width: '100%',
    marginBottom: spacing.md,
  },
  footerText: {
    textAlign: 'center',
    marginTop: spacing.xs,
  },
});
