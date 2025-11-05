import React from 'react';
import {View, TouchableOpacity, ViewStyle} from 'react-native';
import {GestureDetector, Gesture} from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import {Icon} from '../Icon';
import {Body, Caption, Title} from '../Typography';
import {styles} from './ProfileCompletionWidget.styles';
import {colors} from '@theme';
import {useTranslation} from 'react-i18next';

export interface ProfileCompletionData {
  /**
   * Percentage of profile completion (0-100)
   */
  completionPercentage: number;
  /**
   * List of missing profile fields
   */
  missingFields: string[];
  /**
   * Whether the profile has a bio
   */
  hasBio: boolean;
  /**
   * Whether the profile has riding styles
   */
  hasRidingStyles: boolean;
  /**
   * Whether the profile has interests
   */
  hasInterests: boolean;
  /**
   * Whether the profile has social media
   */
  hasSocialMedia: boolean;
  /**
   * Whether the profile has a city
   */
  hasCity: boolean;
}

export interface ProfileCompletionWidgetProps {
  /**
   * Profile completion data
   */
  data: ProfileCompletionData;

  showCloseButton?: boolean;
  /**
   * Callback when the widget is pressed
   */
  onPress?: () => void;
  /**
   * Callback when the widget is closed (swiped up or close button pressed)
   */
  onClose?: () => void;
  /**
   * Additional styles for the container
   */
  style?: ViewStyle;
}

/**
 * A widget component that displays profile completion status and missing fields.
 * Similar to WeatherWidget but for profile completion.
 */
const ProfileCompletionWidget: React.FC<ProfileCompletionWidgetProps> = ({
  data,
  showCloseButton = false,
  onPress,
  onClose,
  style,
}) => {
  const {completionPercentage, missingFields} = data;
  const {t} = useTranslation();

  // Animation values
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(1);

  // Handle close animation and callback
  const handleClose = () => {
    'worklet';
    translateY.value = withSpring(-200, {damping: 15});
    opacity.value = withSpring(0, {damping: 15});
    if (onClose) {
      runOnJS(onClose)();
    }
  };

  // Pan gesture for swipe up
  const panGesture = Gesture.Pan()
    .onUpdate(event => {
      if (event.translationY < 0) {
        translateY.value = event.translationY;
        opacity.value = 1 + event.translationY / 200;
      }
    })
    .onEnd(event => {
      if (event.translationY < -50) {
        // Swiped up enough to close
        handleClose();
      } else {
        // Reset position
        translateY.value = withSpring(0);
        opacity.value = withSpring(1);
      }
    });

  // Animated styles
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{translateY: translateY.value}],
      opacity: opacity.value,
    };
  });

  const widgetContent = (
    <Animated.View style={[animatedStyle]}>
      <View
        style={[
          styles.container,
          {backgroundColor: colors.neutral.black},
          style,
        ]}>
        <View style={styles.infoSection}>
          <View style={styles.header}>
            <Body weight="semiBold" color={colors.neutral.white}>
              {t('components.profileCompletionWidget.complete_your_profile')}
            </Body>
            <View style={styles.headerRight}>
              <Title weight="bold" color={colors.neutral.white}>
                %{completionPercentage}
              </Title>
              {onClose && showCloseButton && (
                <TouchableOpacity
                  onPress={() => handleClose()}
                  style={styles.closeButton}
                  hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
                  <Icon name="close" size={20} color={colors.neutral.white} />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {missingFields.length > 0 && (
            <View style={styles.missingFieldsContainer}>
              <Caption weight="semiBold" color={colors.neutral.white}>
                {t('components.profileCompletionWidget.missing')}:
              </Caption>
              <Caption color={colors.neutral.veryLightGrey} numberOfLines={2}>
                {missingFields.join(', ')}
              </Caption>
            </View>
          )}
        </View>
      </View>
    </Animated.View>
  );

  if (onPress) {
    return (
      <GestureDetector gesture={panGesture}>
        <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
          {widgetContent}
        </TouchableOpacity>
      </GestureDetector>
    );
  }

  return (
    <GestureDetector gesture={panGesture}>{widgetContent}</GestureDetector>
  );
};

export default ProfileCompletionWidget;
