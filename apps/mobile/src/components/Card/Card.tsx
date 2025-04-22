import React from 'react';
import {View, StyleSheet, ViewStyle} from 'react-native';
import {colors, radius, spacing, getShadow} from '@theme';
import {Title, Body} from '../Typography';

interface CardProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  style?: ViewStyle;
  testID?: string;
}

export function Card({children, title, description, style, testID}: CardProps) {
  return (
    <View style={[styles.card, style]} testID={testID}>
      {title && <Title style={styles.title}>{title}</Title>}
      {description && <Body style={styles.description}>{description}</Body>}
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
  title: {
    marginBottom: spacing.sm,
  },
  description: {
    marginBottom: spacing.md,
  },
});
