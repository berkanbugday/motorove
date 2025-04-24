import React from 'react';
import {
  ImageBackground,
  ImageSourcePropType,
  ImageStyle,
  StyleProp,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
  DimensionValue,
} from 'react-native';
import {Typography} from '../Typography';
import {colors} from '@theme';
import {styles} from './FullImageCard.styles';

export interface FullImageCardProps {
  // Required props
  image: ImageSourcePropType;

  // Content props
  title?: string;
  subtitle?: string;
  content?: string;

  // Action props
  onPress?: () => void;
  actionComponent?: React.ReactNode;

  // Style variations
  variant?: 'elevated' | 'outlined' | 'flat';
  size?: 'small' | 'medium' | 'large';
  width?: DimensionValue;
  height?: DimensionValue;
  disabled?: boolean;

  // Custom content
  headerComponent?: React.ReactNode;
  footerComponent?: React.ReactNode;
  children?: React.ReactNode;

  // Style customization
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  imageStyle?: StyleProp<ImageStyle>;
  titleStyle?: StyleProp<TextStyle>;
  subtitleStyle?: StyleProp<TextStyle>;

  // Test ID for testing
  testID?: string;
  accessibilityLabel?: string;
}

export const FullImageCard: React.FC<FullImageCardProps> = ({
  // Required props
  image,

  // Content props
  title,
  subtitle,
  content,

  // Action props
  onPress,
  actionComponent,

  // Style variations
  variant = 'elevated',
  size = 'medium',
  width,
  height,
  disabled = false,

  // Custom content
  headerComponent,
  footerComponent,
  children,

  // Style customization
  style,
  contentStyle,
  imageStyle,
  titleStyle,
  subtitleStyle,

  // Test ID
  testID,
  accessibilityLabel,
}) => {
  const isClickable = !!onPress && !disabled;

  // Build card style based on variant, size, and custom properties
  const cardStyle: StyleProp<ViewStyle> = [
    styles.card,
    variant === 'elevated' && styles.elevatedCard,
    variant === 'outlined' && styles.outlinedCard,
    variant === 'flat' && styles.flatCard,
    size === 'small' && styles.smallCard,
    size === 'medium' && styles.mediumCard,
    size === 'large' && styles.largeCard,
    width !== undefined && {width},
    height !== undefined && {height},
    disabled && styles.disabledCard,
    style,
  ];

  // Determine content style based on size
  const contentContainerStyle = [
    styles.content,
    size === 'small'
      ? styles.smallContent
      : size === 'medium'
      ? styles.mediumContent
      : styles.largeContent,
    contentStyle,
  ];

  const renderContent = () => (
    <View style={contentContainerStyle}>
      {/* Title */}
      {title && (
        <View style={styles.titleContainer}>
          <Typography
            variant={
              size === 'large'
                ? 'title'
                : size === 'small'
                ? 'bodySmall'
                : 'subtitle'
            }
            color={colors.neutral.white}
            style={[styles.title, titleStyle]}>
            {title}
          </Typography>
        </View>
      )}

      {/* Subtitle */}
      {subtitle && (
        <Typography
          variant={size === 'small' ? 'caption' : 'bodySmall'}
          color={colors.neutral.white}
          style={[styles.subtitle, subtitleStyle]}>
          {subtitle}
        </Typography>
      )}

      {/* Text Content */}
      {content && (
        <Typography
          variant="body"
          style={styles.text}
          color={colors.neutral.white}>
          {content}
        </Typography>
      )}

      {/* Custom Content */}
      {children}
    </View>
  );

  const cardContent = (
    <ImageBackground
      source={image}
      style={[styles.imageBackground, imageStyle]}
      resizeMode="cover">
      {headerComponent && <View style={styles.header}>{headerComponent}</View>}

      {renderContent()}

      {/* Card Footer (custom or action) */}
      {(footerComponent || actionComponent) && (
        <View style={styles.footer}>{footerComponent || actionComponent}</View>
      )}
    </ImageBackground>
  );

  // Render as TouchableOpacity if the card is clickable
  if (isClickable) {
    return (
      <TouchableOpacity
        style={cardStyle}
        onPress={onPress}
        disabled={disabled}
        activeOpacity={0.7}
        testID={testID}
        accessibilityLabel={accessibilityLabel}>
        {cardContent}
      </TouchableOpacity>
    );
  }

  // Otherwise render as a regular View
  return (
    <View
      style={cardStyle}
      testID={testID}
      accessibilityLabel={accessibilityLabel}>
      {cardContent}
    </View>
  );
};
