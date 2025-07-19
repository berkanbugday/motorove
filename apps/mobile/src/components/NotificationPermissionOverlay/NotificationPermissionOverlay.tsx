import React from 'react';
import {View, StyleSheet} from 'react-native';
import {useTranslation} from 'react-i18next';
import {FullscreenOverlay} from '../FullscreenOverlay/FullscreenOverlay';
import {colors, spacing, rs, radius, getShadow} from '@theme';
import {Icon} from '../Icon';
import {Body, BodySmall, Caption, Subtitle} from '../Typography';
import {Button} from '../Button';
import LottieView from 'lottie-react-native';

interface NotificationPermissionOverlayProps {
  visible: boolean;
  onAllowPress: () => void;
  onDismiss: () => void;
  onNotAllowPress?: () => void;
}

export function NotificationPermissionOverlay({
  visible,
  onAllowPress,
  onDismiss,
  onNotAllowPress,
}: NotificationPermissionOverlayProps) {
  const {t} = useTranslation();

  return (
    <FullscreenOverlay
      animationType="slide"
      visible={visible}
      onDismiss={onDismiss}
      contentContainerStyle={styles.overlayContent}>
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
          {t('components.notificationPermissionOverlay.title')}
        </Subtitle>
        <BodySmall align="center" style={styles.description}>
          {t('components.notificationPermissionOverlay.description')}
        </BodySmall>

        {/* Features */}
        <View style={styles.featuresContainer}>
          <FeatureItem
            icon="bell-filled"
            title={t(
              'components.notificationPermissionOverlay.features.event_title',
            )}
            text={t('components.notificationPermissionOverlay.features.events')}
          />
          <FeatureItem
            icon="comments-filled"
            title={t(
              'components.notificationPermissionOverlay.features.comment_title',
            )}
            text={t(
              'components.notificationPermissionOverlay.features.comments',
            )}
          />
          <FeatureItem
            icon="users-filled"
            title={t(
              'components.notificationPermissionOverlay.features.group_title',
            )}
            text={t('components.notificationPermissionOverlay.features.groups')}
          />
        </View>

        {/* Buttons */}
        <Button
          title={t(
            'components.notificationPermissionOverlay.allow_notifications',
          )}
          variant="primary"
          shape="round"
          onPress={onAllowPress}
          style={styles.allowButton}
        />

        <Button
          title={t('components.notificationPermissionOverlay.not_allow')}
          variant="outline"
          shape="round"
          onPress={onNotAllowPress}
          style={styles.laterButton}
        />

        {/* Footer */}
        <Caption color={colors.neutral.grey} style={styles.footerText}>
          {t('components.notificationPermissionOverlay.footer_text')}
        </Caption>
      </View>
    </FullscreenOverlay>
  );
}

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
  overlayContent: {
    maxWidth: 400,
    overflow: 'hidden',
    borderRadius: rs(16),
  },
  container: {
    padding: spacing.md,
    alignItems: 'center',
    backgroundColor: colors.neutral.white,
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
