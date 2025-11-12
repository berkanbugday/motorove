import React from 'react';
import {View, StyleSheet, ActivityIndicator, Image} from 'react-native';
import {FullscreenOverlay} from '@components';
import {colors, radius, spacing} from '@theme';

interface LoadingIndicatorProps {
  visible: boolean;
  onDismiss?: () => void;
  closeOnBackButton?: boolean;
}

export const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({
  visible,
  onDismiss = () => {},
  closeOnBackButton = false,
}) => {
  return (
    <FullscreenOverlay
      visible={visible}
      onDismiss={onDismiss}
      animationType="fade"
      closeOnBackButton={closeOnBackButton}
      backdropColor="rgba(0, 0, 0, 0.3)"
      backdropOpacity={0.95}
      contentContainerStyle={styles.container}>
      <View style={styles.content}>
        <Image
          source={require('@assets/images/motorove_logo_light.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <ActivityIndicator size="small" color={colors.neutral.white} />
      </View>
    </FullscreenOverlay>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 150,
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: radius.lg,
  },
  content: {
    padding: spacing.md,
    alignItems: 'center',
    backgroundColor: colors.neutral.black,
  },
  logo: {
    width: 100,
    height: 100,
  },
});
