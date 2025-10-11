import React, {useState, useRef} from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Animated,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import {colors, spacing, getShadow, radius} from '@theme';
import {Icon} from '../Icon';
import {Typography} from '../Typography';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

export interface CollapsibleCardProps {
  /**
   * Title of the collapsible card
   */
  title: string;

  /**
   * Content to be displayed inside the collapsible area
   */
  children: React.ReactNode;

  /**
   * Whether the card is initially expanded
   */
  initiallyExpanded?: boolean;

  /**
   * Custom styles for the card container
   */
  style?: any;

  /**
   * Custom styles for the content area
   */
  contentStyle?: any;

  /**
   * Custom styles for the header
   */
  headerStyle?: any;

  /**
   * Whether to show the expand/collapse icon
   */
  showIcon?: boolean;

  /**
   * Callback when the card is expanded/collapsed
   */
  onToggle?: (isExpanded: boolean) => void;
}

/**
 * A collapsible card component that can expand and collapse its content
 */
export const CollapsibleCard: React.FC<CollapsibleCardProps> = ({
  title,
  children,
  initiallyExpanded = false,
  style,
  contentStyle,
  headerStyle,
  showIcon = true,
  onToggle,
}) => {
  const [isExpanded, setIsExpanded] = useState(initiallyExpanded);
  const rotateValue = useRef(
    new Animated.Value(initiallyExpanded ? 1 : 0),
  ).current;

  const toggleExpanded = () => {
    const newExpandedState = !isExpanded;
    // Configure layout animation
    LayoutAnimation.configureNext({
      duration: 300,
      create: {
        type: LayoutAnimation.Types.easeInEaseOut,
        property: LayoutAnimation.Properties.opacity,
      },
      update: {
        type: LayoutAnimation.Types.easeInEaseOut,
      },
    });

    // Animate the icon rotation
    Animated.timing(rotateValue, {
      toValue: newExpandedState ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();

    setIsExpanded(newExpandedState);
    onToggle?.(newExpandedState);
  };

  const rotateInterpolate = rotateValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  return (
    <View style={[styles.card, style]}>
      <TouchableOpacity
        style={[styles.header, headerStyle]}
        onPress={toggleExpanded}
        activeOpacity={0.7}>
        <Typography style={styles.title}>{title}</Typography>
        {showIcon && (
          <Animated.View
            style={[
              styles.iconContainer,
              {transform: [{rotate: rotateInterpolate}]},
            ]}>
            <Icon
              name="chevron-down"
              size={16}
              color={colors.neutral.darkGrey}
            />
          </Animated.View>
        )}
      </TouchableOpacity>

      {isExpanded && (
        <View style={[styles.content, contentStyle]}>{children}</View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.neutral.white,
    borderRadius: radius.md,
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    ...getShadow('medium'),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    paddingBottom: spacing.md,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.neutral.black,
    flex: 1,
  },
  iconContainer: {
    marginLeft: spacing.sm,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    paddingTop: 0,
  },
});

export default CollapsibleCard;
