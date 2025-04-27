import React from 'react';
import {View, StyleSheet} from 'react-native';
import {FullscreenOverlay} from '../FullscreenOverlay/FullscreenOverlay';
import {colors, spacing, rs} from '@theme';
import {Icon} from '../Icon';
import {Body, Caption, Title} from '../Typography';
import {Button} from '../Button';
import LottieView from 'lottie-react-native';

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
  return (
    <FullscreenOverlay
      animationType="slide"
      visible={visible}
      onDismiss={onDismiss}
      contentContainerStyle={styles.overlayContent}>
      <View style={styles.container}>
        {/* Header */}
        {/* <View style={styles.header}>
          <Icon name="map-pin" size={24} color={colors.neutral.black} />
          <Subtitle style={styles.headerText}>Enable Location Access</Subtitle>
        </View> */}

        {/* Hero Image */}
        <View style={styles.imageContainer}>
          <LottieView
            source={require('../../assets/lottie/location_permission.json')}
            style={styles.heroImage}
            autoPlay
            loop
          />
        </View>

        {/* Content */}
        <Title style={styles.title}>Enhance Your Riding Experience</Title>
        <Body color={colors.neutral.darkGrey} style={styles.description}>
          Motorove uses your location to show nearby routes, rides, and
          motorcycle services. Discover the best riding spots and connect with
          local riders in your area.
        </Body>

        {/* Features */}
        <View style={styles.featuresContainer}>
          <FeatureItem icon="route" text="Find the best local riding routes" />
          <FeatureItem icon="comments" text="Connect with nearby riders" />
          <FeatureItem icon="wrench" text="Locate motorcycle services" />
        </View>

        {/* Buttons */}
        <Button
          title="Allow Location Access"
          variant="primary"
          shape="round"
          onPress={onAllowPress}
          style={styles.allowButton}
        />

        {onOpenSettings && (
          <Button
            title="Open Settings"
            variant="outline"
            shape="round"
            onPress={onOpenSettings}
            style={styles.laterButton}
          />
        )}

        <Button
          title="Not Now"
          variant="text"
          shape="round"
          onPress={onDismiss}
          style={styles.laterButton}
        />

        {/* Footer */}
        <Caption color={colors.neutral.grey} style={styles.footerText}>
          You can always change location settings later in the app preferences
        </Caption>
      </View>
    </FullscreenOverlay>
  );
}

interface FeatureItemProps {
  icon: 'map-pin' | 'route' | 'comments' | 'wrench';
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
