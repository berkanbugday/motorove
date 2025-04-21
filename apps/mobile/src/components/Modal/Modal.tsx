import React from 'react';
import {
  View,
  StyleSheet,
  Modal as RNModal,
  TouchableOpacity,
  Text,
  ViewStyle,
  ScrollView,
  useWindowDimensions,
  Platform,
} from 'react-native';
import {colors, spacing, fontSizes, radius} from '@theme/index';
import {Icon} from '../Icon';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

interface ModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  contentStyle?: ViewStyle;
}

export function Modal({
  visible,
  onClose,
  title,
  children,
  contentStyle,
}: ModalProps) {
  const insets = useSafeAreaInsets();
  const {height} = useWindowDimensions();
  const maxHeight = height * 0.8;

  return (
    <RNModal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View
          style={[
            styles.container,
            {
              maxHeight,
              paddingBottom: Math.max(insets.bottom, spacing.md),
            },
            contentStyle,
          ]}>
          <View style={styles.header}>
            {title && <Text style={styles.title}>{title}</Text>}
            <TouchableOpacity
              onPress={onClose}
              style={styles.closeButton}
              hitSlop={{top: 10, right: 10, bottom: 10, left: 10}}>
              <Icon name="close" size={20} color={colors.neutral.grey} />
            </TouchableOpacity>
          </View>
          <ScrollView
            contentContainerStyle={styles.contentContainer}
            showsVerticalScrollIndicator={false}>
            {children}
          </ScrollView>
        </View>
      </View>
    </RNModal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: colors.neutral.white,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    paddingTop: spacing.md,
    ...(Platform.OS === 'ios'
      ? {
          shadowColor: '#000',
          shadowOffset: {width: 0, height: 2},
          shadowOpacity: 0.15,
          shadowRadius: 4,
        }
      : {
          elevation: 4,
        }),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  title: {
    fontSize: fontSizes.lg,
    fontWeight: '600',
    color: colors.neutral.black,
    flex: 1,
    textAlign: 'center',
  },
  closeButton: {
    position: 'absolute',
    right: spacing.lg,
    padding: spacing.xs,
  },
  contentContainer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
});
