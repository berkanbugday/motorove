import React from 'react';
import {View, StyleSheet, ViewStyle} from 'react-native';
import {colors, radius, spacing, getShadow} from '@theme';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  testID?: string;
}

export function Card({children, style, testID}: CardProps) {
  return (
    <View style={[styles.card, style]} testID={testID}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.neutral.white,
    borderRadius: radius.md,
    padding: spacing.md,
    marginVertical: spacing.sm,
    ...getShadow('small'),
  },
});
