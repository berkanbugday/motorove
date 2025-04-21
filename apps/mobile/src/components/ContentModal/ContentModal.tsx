import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {Modal} from '../Modal';
import {colors, fontSizes, spacing} from '@theme/index';

interface ContentModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  content: string;
}

export function ContentModal({
  visible,
  onClose,
  title,
  content,
}: ContentModalProps) {
  return (
    <Modal visible={visible} onClose={onClose} title={title}>
      <View style={styles.content}>
        <Text style={styles.contentText}>{content}</Text>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: spacing.md,
  },
  contentText: {
    fontSize: fontSizes.md,
    lineHeight: fontSizes.md * 1.5,
    color: colors.neutral.darkGrey,
  },
});
