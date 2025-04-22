import React from 'react';
import {Text, TextProps, StyleSheet, TextStyle} from 'react-native';
import {typography, fontWeights, TypographyType} from '@theme/typography';
import {colors} from '@theme/colors';

export type TypographyVariant = keyof TypographyType;

interface TypographyProps extends TextProps {
  variant?: TypographyVariant;
  weight?: keyof typeof fontWeights;
  color?: string;
  align?: 'auto' | 'left' | 'right' | 'center' | 'justify';
  children: React.ReactNode;
}

export const Typography: React.FC<TypographyProps> = ({
  variant = 'body',
  weight,
  color = colors.neutral.black,
  align = 'left',
  style,
  children,
  ...props
}) => {
  const variantStyle = typography[variant] as TextStyle;

  const textStyle = StyleSheet.compose(
    {
      ...variantStyle,
      color,
      textAlign: align,
      ...(weight && {fontWeight: fontWeights[weight]}),
    } as TextStyle,
    style as TextStyle,
  );

  return (
    <Text style={textStyle} {...props}>
      {children}
    </Text>
  );
};

// Predefined components for common typography variants
export const LargeTitle: React.FC<Omit<TypographyProps, 'variant'>> = props => (
  <Typography variant="largeTitle" {...props} />
);

export const Title: React.FC<Omit<TypographyProps, 'variant'>> = props => (
  <Typography variant="title" {...props} />
);

export const Subtitle: React.FC<Omit<TypographyProps, 'variant'>> = props => (
  <Typography variant="subtitle" {...props} />
);

export const Body: React.FC<Omit<TypographyProps, 'variant'>> = props => (
  <Typography variant="body" {...props} />
);

export const BodySmall: React.FC<Omit<TypographyProps, 'variant'>> = props => (
  <Typography variant="bodySmall" {...props} />
);

export const Caption: React.FC<Omit<TypographyProps, 'variant'>> = props => (
  <Typography variant="caption" {...props} />
);
