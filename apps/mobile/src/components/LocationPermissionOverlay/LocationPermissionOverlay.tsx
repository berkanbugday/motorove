import React from 'react';
import {View, StyleSheet} from 'react-native';
import {FullscreenOverlay} from '../FullscreenOverlay/FullscreenOverlay';
import {colors, spacing, rs} from '@theme';
import {Icon} from '../Icon';
import {Body, Caption, Title} from '../Typography';
import {Button} from '../Button';
import LottieView from 'lottie-react-native';
import {useTranslation} from '@hooks/useTranslation';

interface LocationPermissionOverlayProps {
  visible: boolean;
  onAllowPress: () => void;
  onDismiss: () => void;
  onOpenSettings?: () => void;
}

export function LocationPermissionOverlay({
  visible,
  onAllowPress,
  onDismiss,
  onOpenSettings,
}: LocationPermissionOverlayProps) {
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
            source={require('../../assets/lottie/location_permission.json')}
            style={styles.heroImage}
            autoPlay
            renderMode="SOFTWARE"
          />
        </View>

        {/* Content */}
        <Title style={styles.title}>
          {t('components.locationPermissionOverlay.title')}
        </Title>
        <Body color={colors.neutral.darkGrey} style={styles.description}>
          {t('components.locationPermissionOverlay.description')}
        </Body>

        {/* Features */}
        <View style={styles.featuresContainer}>
          <FeatureItem
            icon="error-filled"
            text={t(
              'components.locationPermissionOverlay.show_nearby_warnings',
            )}
          />
          <FeatureItem
            icon="comments-filled"
            text={t(
              'components.locationPermissionOverlay.connect_with_nearby_riders',
            )}
          />
          <FeatureItem
            icon="wrench-filled"
            text={t(
              'components.locationPermissionOverlay.find_motorcycle_services',
            )}
          />
        </View>

        {/* Buttons */}
        <Button
          title={t(
            'components.locationPermissionOverlay.allow_location_access',
          )}
          variant="primary"
          shape="round"
          onPress={onAllowPress}
          style={styles.allowButton}
        />

        {onOpenSettings && (
          <Button
            title={t('components.locationPermissionOverlay.open_settings')}
            variant="outline"
            shape="round"
            onPress={onOpenSettings}
            style={styles.laterButton}
          />
        )}

        <Button
          title={t('common.not_now')}
          variant="text"
          shape="round"
          onPress={onDismiss}
          style={styles.laterButton}
        />

        {/* Footer */}
        <Caption color={colors.neutral.grey} style={styles.footerText}>
          {t('components.locationPermissionOverlay.footer_text')}
        </Caption>
      </View>
    </FullscreenOverlay>
  );
}

interface FeatureItemProps {
  icon:
    | 'map-pin-filled'
    | 'route'
    | 'route-filled'
    | 'comments'
    | 'comments-filled'
    | 'wrench'
    | 'wrench-filled'
    | 'error-filled';

  text: string;
}

function FeatureItem({icon, text}: FeatureItemProps) {
  return (
    <View style={styles.featureItem}>
      <View style={styles.featureIconContainer}>
        <Icon name={icon} size={18} color={colors.neutral.black} />
      </View>
      <Body color={colors.neutral.darkGrey} style={styles.featureText}>
        {text}
      </Body>
    </View>
  );
}

const styles = StyleSheet.create({
  overlayContent: {
    width: '90%',
    maxWidth: 400,
    overflow: 'hidden',
    borderRadius: rs(16),
  },
  container: {
    padding: spacing.md,
    alignItems: 'center',
    backgroundColor: colors.neutral.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  headerText: {
    marginLeft: spacing.xs,
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
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  description: {
    textAlign: 'center',
    marginBottom: spacing.md,
    lineHeight: rs(23),
  },
  featuresContainer: {
    width: '100%',
    marginBottom: spacing.md,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginVertical: spacing.xs,
  },
  featureIconContainer: {
    width: rs(36),
    height: rs(36),
    borderRadius: rs(18),
    backgroundColor: colors.neutral.veryLightGrey,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.xs,
  },
  featureText: {
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
