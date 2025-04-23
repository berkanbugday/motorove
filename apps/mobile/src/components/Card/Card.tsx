import React from 'react';
import {
  View,
  TouchableOpacity,
  StyleProp,
  ViewStyle,
  Image,
  ImageSourcePropType,
  ImageStyle,
  DimensionValue,
  ImageBackground,
  TextStyle,
} from 'react-native';
import {colors} from '@theme';
import {Typography} from '../Typography';
import {styles} from './Card.styles';

export interface CardProps {
  // Content props
  title?: string;
  subtitle?: string;
  content?: string;
  image?: ImageSourcePropType;
  fullImage?: boolean;

  // Action props
  onPress?: () => void;
  actionComponent?: React.ReactNode;

  // Style variations
  variant?: 'elevated' | 'outlined' | 'flat';
  size?: 'small' | 'medium' | 'large';
  width?: DimensionValue;
  height?: DimensionValue;
  backgroundColor?: string;
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

export const Card: React.FC<CardProps> = ({
  // Content props
  title,
  subtitle,
  content,
  image,
  fullImage = false,

  // Action props
  onPress,
  actionComponent,

  // Style variations
  variant = 'elevated',
  size = 'medium',
  width,
  height,
  backgroundColor,
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
    backgroundColor !== undefined && {backgroundColor},
    disabled && styles.disabledCard,
    style,
  ];

  // Determine padding for content based on size and fullImage mode
  const contentPadding = [
    styles.content,
    fullImage
      ? styles.fullImageContent
      : size === 'small'
      ? styles.smallContent
      : size === 'medium'
      ? styles.mediumContent
      : styles.largeContent,
    contentStyle,
  ];

  const renderContent = () => (
    <View style={contentPadding}>
      {/* Title and Subtitle */}
      {title && (
        <View style={fullImage ? styles.titleContainer : undefined}>
          <Typography
            variant={
              size === 'large'
                ? 'title'
                : size === 'small'
                ? 'bodySmall'
                : 'subtitle'
            }
            color={fullImage ? colors.neutral.white : undefined}
            style={[styles.title, titleStyle]}>
            {title}
          </Typography>
        </View>
      )}

      {subtitle && (
        <Typography
          variant={size === 'small' ? 'caption' : 'bodySmall'}
          color={fullImage ? colors.neutral.white : colors.neutral.grey}
          style={[styles.subtitle, subtitleStyle]}>
          {subtitle}
        </Typography>
      )}

      {/* Text Content */}
      {content && (
        <Typography
          variant="body"
          style={styles.text}
          color={fullImage ? colors.neutral.white : undefined}>
          {content}
        </Typography>
      )}

      {/* Custom Content */}
      {children}
    </View>
  );

  const cardContent =
    fullImage && image ? (
      <ImageBackground
        source={image}
        style={[{width: '100%', height: '100%'}, imageStyle]}
        resizeMode="cover">
        {renderContent()}
        {/* Card Footer (custom or action) */}
        {(footerComponent || actionComponent) && (
          <View style={[styles.footer, styles.fullImageFooter]}>
            {footerComponent || actionComponent}
          </View>
        )}
      </ImageBackground>
    ) : (
      <>
        {/* Card Header (custom or default) */}
        {headerComponent
          ? headerComponent
          : image && (
              <Image
                source={image}
                style={[styles.image, imageStyle]}
                resizeMode="cover"
              />
            )}

        {/* Card Content */}
        {renderContent()}

        {/* Card Footer (custom or action) */}
        {(footerComponent || actionComponent) && (
          <View style={styles.footer}>
            {footerComponent || actionComponent}
          </View>
        )}
      </>
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
