import React, {useRef, useEffect} from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Animated,
  Text,
} from 'react-native';
import {BottomTabBarProps} from '@react-navigation/bottom-tabs';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Icon, IconName} from '@components/Icon';
import {colors} from '@theme/colors';

/**
 * Custom Tab Bar component for bottom navigation
 */
export const CustomTabBar: React.FC<BottomTabBarProps> = ({
  state,
  descriptors,
  navigation,
}) => {
  const insets = useSafeAreaInsets();
  const {width} = Dimensions.get('window');
  const tabWidth = width / state.routes.length;

  // Create animated values for each tab
  const animatedValues = useRef(
    state.routes.map(() => new Animated.Value(0)),
  ).current;

  // Container for indicator position animation
  const indicatorPosition = useRef(new Animated.Value(0)).current;

  // Update animation values when tab focus changes
  useEffect(() => {
    // Animate all tabs
    animatedValues.forEach((value, index) => {
      Animated.timing(value, {
        toValue: index === state.index ? 1 : 0,
        duration: 250,
        useNativeDriver: false,
      }).start();
    });

    // Animate indicator position
    Animated.spring(indicatorPosition, {
      toValue: state.index,
      friction: 8,
      tension: 50,
      useNativeDriver: true,
    }).start();
  }, [state.index, animatedValues, indicatorPosition]);

  // Get icon name based on route name
  const getIconName = (routeName: string): IconName => {
    switch (routeName) {
      case 'HomeTab':
        return 'home';
      case 'ExploreTab':
        return 'map-location';
      case 'ProfileTab':
        return 'user-gear';
      case 'SettingsTab':
        return 'wrench'; // Using wrench instead of settings
      default:
        return 'home';
    }
  };

  return (
    <View
      style={[
        styles.container,
        {
          height: 60 + insets.bottom,
          paddingBottom: insets.bottom,
        },
      ]}>
      {/* Animated indicator that moves between tabs */}
      <Animated.View
        style={[
          styles.slidingIndicator,
          {
            transform: [
              {
                translateX: indicatorPosition.interpolate({
                  inputRange: Array.from(
                    {length: state.routes.length},
                    (_, i) => i,
                  ),
                  outputRange: Array.from(
                    {length: state.routes.length},
                    (_, i) => i * tabWidth + tabWidth / 2 - 36,
                  ),
                }),
              },
            ],
          },
        ]}
      />

      {state.routes.map((route, index) => {
        const {options} = descriptors[route.key];
        const label = options.tabBarLabel || options.title || route.name;
        const isFocused = state.index === index;
        const animatedValue = animatedValues[index];
        const badge = options.tabBarBadge;

        const scale = animatedValue.interpolate({
          inputRange: [0, 1],
          outputRange: [1, 1.1],
        });

        const textColor = animatedValue.interpolate({
          inputRange: [0, 1],
          outputRange: [colors.neutral.grey, colors.neutral.black],
        });

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name, {merge: true});
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: 'tabLongPress',
            target: route.key,
          });
        };

        return (
          <TouchableOpacity
            key={route.key}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityState={isFocused ? {selected: true} : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            testID={route.name + '-tab'}
            onPress={onPress}
            onLongPress={onLongPress}
            style={styles.tabButton}>
            <View style={styles.iconContainer}>
              <Animated.View
                style={{
                  transform: [{scale}],
                }}>
                <Icon
                  name={getIconName(route.name)}
                  color={isFocused ? colors.primary.main : colors.neutral.grey}
                  size={24}
                />
              </Animated.View>

              {badge !== undefined && (
                <View
                  style={[
                    styles.badgeContainer,
                    {
                      backgroundColor: isFocused
                        ? colors.neutral.black
                        : colors.primary.main,
                    },
                  ]}>
                  <Text style={styles.badgeText}>
                    {typeof badge === 'number' && badge > 99 ? '99+' : badge}
                  </Text>
                </View>
              )}
            </View>

            <Animated.Text
              style={[
                styles.tabLabel,
                {
                  color: textColor,
                  transform: [{scale}],
                },
              ]}>
              {(label as string).replace('Tab', '')}
            </Animated.Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    borderTopWidth: 0,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    backgroundColor: colors.neutral.white,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 5,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    position: 'relative',
  },
  tabLabel: {
    fontSize: 10,
    marginTop: 5,
    fontWeight: '500',
  },
  slidingIndicator: {
    position: 'absolute',
    top: 6,
    width: 72,
    height: 32,
    borderRadius: 18,
    backgroundColor: colors.primary.light,
    opacity: 0.15,
  },
  badgeContainer: {
    position: 'absolute',
    top: -5,
    right: -10,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: colors.neutral.white,
    fontSize: 10,
    fontWeight: 'bold',
  },
});
