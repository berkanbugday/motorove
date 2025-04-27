import React from 'react';
import {
  View,
  TouchableOpacity,
  StyleProp,
  ViewStyle,
  TextStyle,
} from 'react-native';
import {Typography} from '../Typography';
import {Icon, IconName} from '../Icon';
import {Chip, ChipColor} from '../Chip';
import {colors} from '@theme';
import {styles} from './MarkerInfoCard.styles';
import {Button} from '@components/Button';

export interface InfoLine {
  /**
   * Icon to show before the text
   */
  icon: IconName;

  /**
   * Text content to display
   */
  text: string;

  /**
   * Optional color for the icon
   */
  iconColor?: string;
}

export interface MarkerInfoCardProps {
  /**
   * Title of the location or point
   */
  title: string;

  /**
   * Optional subtitle text
   */
  subtitle?: string;

  /**
   * Icon to show with title (optional)
   */
  titleIcon?: IconName;

  /**
   * Custom color for title icon
   */
  titleIconColor?: string;

  /**
   * Lines of information with icons
   */
  infoLines?: InfoLine[];

  /**
   * Tags/chips to display
   */
  tags?: Array<{
    id: string;
    label: string;
    color?: ChipColor;
    onPress?: () => void;
  }>;

  /**
   * Distance to the point (e.g., "2.5 km")
   */
  distance?: string;

  /**
   * Primary action button label
   */
  primaryAction?: string;

  /**
   * Handler for primary action button
   */
  onPrimaryAction?: () => void;

  /**
   * Secondary action button label
   */
  secondaryAction?: string;

  /**
   * Handler for secondary action button
   */
  onSecondaryAction?: () => void;

  /**
   * Thirdy action button label
   */
  thirdyAction?: string;

  /**
   * Handler for thirdy action button
   */
  onThirdyAction?: () => void;

  /**
   * Whether the card is interactive
   */
  interactive?: boolean;

  /**
   * Handler for when the card is pressed
   */
  onPress?: () => void;

  /**
   * Variant of the card
   */
  variant?: 'normal' | 'compact' | 'elevated';

  /**
   * Custom styles for the card container
   */
  style?: StyleProp<ViewStyle>;

  /**
   * Custom styles for the content
   */
  contentStyle?: StyleProp<ViewStyle>;

  /**
   * Custom styles for the title
   */
  titleStyle?: StyleProp<TextStyle>;

  /**
   * Custom styles for the subtitle
   */
  subtitleStyle?: StyleProp<TextStyle>;

  /**
   * Show close button in the card
   */
  showCloseButton?: boolean;

  /**
   * Handler for close button press
   */
  onClose?: () => void;

  /**
   * Test ID for testing
   */
  testID?: string;
}

export const MarkerInfoCard: React.FC<MarkerInfoCardProps> = ({
  title,
  subtitle,
  titleIcon,
  titleIconColor = colors.primary.main,
  infoLines = [],
  tags = [],
  distance,
  primaryAction,
  onPrimaryAction,
  secondaryAction,
  onSecondaryAction,
  thirdyAction,
  onThirdyAction,
  interactive = true,
  onPress,
  variant = 'normal',
  style,
  contentStyle,
  titleStyle,
  subtitleStyle,
  showCloseButton = false,
  onClose,
  testID,
}) => {
  // Determine the card style based on variant
  const cardBaseStyle = [
    styles.container,
    variant === 'compact' && styles.compactContainer,
    variant === 'elevated' && styles.elevatedContainer,
    style,
  ];

  // Render the card content
  const renderContent = () => (
    <View style={[styles.content, contentStyle]}>
      {/* Title row with optional icon and close button */}
      <View style={styles.titleContainer}>
        {titleIcon && (
          <Icon
            name={titleIcon}
            size={variant === 'compact' ? 18 : 24}
            color={titleIconColor}
            style={styles.titleIcon}
          />
        )}
        <Typography
          variant={variant === 'compact' ? 'subtitle' : 'title'}
          weight="bold"
          style={[styles.title, titleStyle]}>
          {title}
        </Typography>

        {/* Distance badge, if provided */}
        {distance && (
          <Chip label={distance} color="dark" size="small" variant="outlined" />
        )}

        {/* Close button if enabled */}
        {showCloseButton && (
          <Button
            variant="primary"
            size="small"
            shape="circle"
            onPress={onClose}
            iconName="close"
            style={styles.closeButton}
          />
        )}
      </View>

      {/* Subtitle */}
      {subtitle && (
        <Typography
          variant="bodySmall"
          color={colors.neutral.grey}
          style={[styles.subtitle, subtitleStyle]}>
          {subtitle}
        </Typography>
      )}

      {/* Info lines with icons */}
      {infoLines.length > 0 && (
        <View style={styles.infoLinesContainer}>
          {infoLines.map((line, index) => (
            <View key={`info-line-${index}`} style={styles.infoLine}>
              <Icon
                name={line.icon}
                size={16}
                color={line.iconColor || colors.neutral.grey}
                style={styles.infoIcon}
              />
              <Typography variant="bodySmall" color={colors.neutral.darkGrey}>
                {line.text}
              </Typography>
            </View>
          ))}
        </View>
      )}

      {/* Tags */}
      {tags.length > 0 && (
        <View style={styles.tagsContainer}>
          {tags.map(tag => (
            <Chip
              key={tag.id}
              label={tag.label}
              color={tag.color || 'light'}
              size="small"
              variant="outlined"
              onPress={tag.onPress}
              style={styles.tag}
            />
          ))}
        </View>
      )}

      {/* Action buttons */}
      <View style={styles.actionsContainer}>
        {(primaryAction || secondaryAction) && (
          <View style={styles.primarySecondaryActionsContainer}>
            {primaryAction && (
              <Button
                title={primaryAction}
                variant="dark"
                size="medium"
                shape="round"
                onPress={onPrimaryAction}
                iconName="paper-plane-filled"
                disabled={!onPrimaryAction}
              />
            )}
            {secondaryAction && (
              <Button
                title={secondaryAction}
                variant="primary"
                size="medium"
                shape="round"
                onPress={onSecondaryAction}
                iconName="phone"
                disabled={!onSecondaryAction}
                style={styles.secondaryButton}
              />
            )}
          </View>
        )}
        {thirdyAction && (
          <Button
            title={thirdyAction}
            variant="secondary"
            size="medium"
            shape="round"
            onPress={onThirdyAction}
            iconName="save-filled"
            disabled={!onThirdyAction}
          />
        )}
      </View>
    </View>
  );

  // If card is interactive and has onPress handler, wrap in TouchableOpacity
  if (interactive && onPress) {
    return (
      <TouchableOpacity
        style={cardBaseStyle}
        onPress={onPress}
        activeOpacity={0.8}
        testID={testID}>
        {renderContent()}
      </TouchableOpacity>
    );
  }

  // Otherwise render as a normal View
  return (
    <View style={cardBaseStyle} testID={testID}>
      {renderContent()}
    </View>
  );
};
