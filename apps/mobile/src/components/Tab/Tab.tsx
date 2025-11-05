import React, {useEffect, useRef, useState} from 'react';
import {
  View,
  TouchableOpacity,
  ScrollView,
  Animated,
  ViewStyle,
  TextStyle,
  StyleProp,
  LayoutChangeEvent,
} from 'react-native';
import {Typography} from '../Typography';
import {Icon, IconName} from '../Icon';
import {styles} from './Tab.styles';

export type TabVariant =
  | 'default'
  | 'filled'
  | 'pill'
  | 'underlined'
  | 'minimal';
export type TabSize = 'small' | 'medium' | 'large';
export type TabPosition = 'top' | 'bottom';
export type TabAlign = 'start' | 'center' | 'stretch';

export interface TabItem {
  /**
   * Unique key for tab
   */
  key: string;
  /**
   * Label text to display
   */
  label: string;
  /**
   * Optional icon to display with label
   */
  icon?: IconName;
  /**
   * Optional badge count to display
   */
  badge?: number;
  /**
   * Whether this tab is disabled
   */
  disabled?: boolean;
  /**
   * Custom render function for tab content
   */
  renderTab?: (isActive: boolean) => React.ReactNode;
  /**
   * Custom styles for this tab
   */
  style?: StyleProp<ViewStyle>;
  /**
   * Content to render when this tab is active
   */
  content?: React.ReactNode;
}

export interface TabsProps {
  /**
   * Array of tab items
   */
  items: TabItem[];
  /**
   * Currently selected tab key
   */
  selectedKey?: string;
  /**
   * Callback when a tab is selected
   */
  onTabChange?: (key: string) => void;
  /**
   * Visual variant of tabs
   */
  variant?: TabVariant;
  /**
   * Size of the tabs
   */
  size?: TabSize;
  /**
   * Position of the tabs
   */
  position?: TabPosition;
  /**
   * How tabs should be aligned
   */
  align?: TabAlign;
  /**
   * Whether tabs can be scrolled horizontally
   */
  scrollable?: boolean;
  /**
   * Icon position in tab
   */
  iconPosition?: 'left' | 'right' | 'top';
  /**
   * Whether to show the icon
   */
  showIcon?: boolean;
  /**
   * Whether to show the label
   */
  showLabel?: boolean;
  /**
   * Whether tabs should take equal width
   */
  equalWidth?: boolean;
  /**
   * Animation duration in milliseconds
   */
  animationDuration?: number;
  /**
   * Whether to animate tab changes
   */
  animated?: boolean;
  /**
   * Custom style for the tab container
   */
  containerStyle?: StyleProp<ViewStyle>;
  /**
   * Custom style for individual tabs
   */
  tabStyle?: StyleProp<ViewStyle>;
  /**
   * Custom style for tab labels
   */
  labelStyle?: StyleProp<TextStyle>;
  /**
   * Custom style for the active indicator
   */
  indicatorStyle?: StyleProp<ViewStyle>;
  /**
   * Custom style for the tab content container
   */
  contentContainerStyle?: StyleProp<ViewStyle>;
  /**
   * Test ID for testing
   */
  testID?: string;
}

export const Tabs: React.FC<TabsProps> = ({
  items,
  selectedKey,
  onTabChange,
  variant = 'default',
  size = 'medium',
  position = 'top',
  align = 'start',
  scrollable = false,
  iconPosition = 'left',
  showIcon = true,
  showLabel = true,
  equalWidth = false,
  animationDuration = 300,
  animated = true,
  containerStyle,
  tabStyle,
  labelStyle,
  indicatorStyle,
  contentContainerStyle,
  testID,
}) => {
  // Default to first tab if no selected key is provided
  const [activeKey, setActiveKey] = useState<string>(
    selectedKey || items[0]?.key || '',
  );
  const [tabWidths, setTabWidths] = useState<{[key: string]: number}>({});
  const [tabPositions, setTabPositions] = useState<{[key: string]: number}>({});

  // Animation values
  const indicatorAnimation = useRef(new Animated.Value(0)).current;
  const indicatorWidthAnimation = useRef(new Animated.Value(0)).current;

  // Refs for measuring tab positions
  const scrollViewRef = useRef<ScrollView>(null);
  const initialMeasurementComplete = useRef(false);

  // Update active key if selectedKey prop changes
  useEffect(() => {
    if (selectedKey && selectedKey !== activeKey) {
      setActiveKey(selectedKey);
    }
  }, [selectedKey]);

  // Animate indicator when active key changes
  useEffect(() => {
    if (!initialMeasurementComplete.current || !animated) {
      return;
    }

    const tabPosition = tabPositions[activeKey] || 0;
    const width = tabWidths[activeKey] || 0;

    Animated.parallel([
      Animated.timing(indicatorAnimation, {
        toValue: tabPosition,
        duration: animationDuration,
        useNativeDriver: false,
      }),
      Animated.timing(indicatorWidthAnimation, {
        toValue: width,
        duration: animationDuration,
        useNativeDriver: false,
      }),
    ]).start();

    // Scroll to make active tab visible if scrollable
    if (scrollable && scrollViewRef.current) {
      scrollViewRef.current.scrollTo({
        x: Math.max(0, tabPosition - 50), // Center active tab with some padding
        animated: true,
      });
    }
  }, [activeKey, tabPositions, tabWidths, animated, animationDuration]);

  // Complete measurement setup on first render
  useEffect(() => {
    if (
      Object.keys(tabWidths).length === items.length &&
      !initialMeasurementComplete.current
    ) {
      initialMeasurementComplete.current = true;

      // Initial animation to position indicator
      const tabPosition = tabPositions[activeKey] || 0;
      const width = tabWidths[activeKey] || 0;

      indicatorAnimation.setValue(tabPosition);
      indicatorWidthAnimation.setValue(width);
    }
  }, [tabWidths, tabPositions, items.length]);

  const handleTabPress = (key: string) => {
    if (key !== activeKey) {
      setActiveKey(key);
      onTabChange?.(key);
    }
  };

  const measureTabLayout = (key: string, event: LayoutChangeEvent) => {
    const {width, x} = event.nativeEvent.layout;

    setTabWidths(prev => ({
      ...prev,
      [key]: width,
    }));

    setTabPositions(prev => ({
      ...prev,
      [key]: x,
    }));
  };

  const renderTab = (item: TabItem, _index: number) => {
    const isActive = item.key === activeKey;
    const tabTestID = `${testID}-tab-${item.key}`;

    // If custom render function is provided, use it
    if (item.renderTab) {
      return (
        <TouchableOpacity
          key={item.key}
          activeOpacity={0.7}
          onPress={() => !item.disabled && handleTabPress(item.key)}
          style={[
            styles.tab,
            getTabStyle(variant, size, isActive, item.disabled),
            equalWidth && styles.equalWidthTab,
            item.style,
            tabStyle,
          ]}
          disabled={item.disabled}
          accessibilityRole="tab"
          accessibilityState={{selected: isActive}}
          testID={tabTestID}
          onLayout={e => measureTabLayout(item.key, e)}>
          {item.renderTab(isActive)}
        </TouchableOpacity>
      );
    }

    return (
      <TouchableOpacity
        key={item.key}
        activeOpacity={0.7}
        onPress={() => !item.disabled && handleTabPress(item.key)}
        style={[
          styles.tab,
          getTabStyle(variant, size, isActive, item.disabled),
          equalWidth && styles.equalWidthTab,
          item.style,
          tabStyle,
        ]}
        disabled={item.disabled}
        accessibilityRole="tab"
        accessibilityState={{selected: isActive}}
        testID={tabTestID}
        onLayout={e => measureTabLayout(item.key, e)}>
        <View style={[styles.tabContent, getTabContentStyle(iconPosition)]}>
          {showIcon &&
            item.icon &&
            (iconPosition === 'left' || iconPosition === 'top') && (
              <Icon
                name={item.icon}
                size={getIconSize(size)}
                color={getIconColor(variant, isActive, item.disabled)}
                style={getIconStyle(iconPosition, showLabel)}
              />
            )}

          {showLabel && (
            <Typography
              variant={getTypographyVariant(size)}
              color={getTextColor(variant, isActive, item.disabled)}
              weight={isActive ? 'semiBold' : 'regular'}
              style={labelStyle}>
              {item.label}
            </Typography>
          )}

          {showIcon && item.icon && iconPosition === 'right' && (
            <Icon
              name={item.icon}
              size={getIconSize(size)}
              color={getIconColor(variant, isActive, item.disabled)}
              style={getIconStyle(iconPosition, showLabel)}
            />
          )}

          {item.badge !== undefined && (
            <View style={styles.badgeContainer}>
              <Typography
                variant="caption"
                color="#fff"
                style={styles.badgeText}>
                {item.badge > 99 ? '99+' : item.badge}
              </Typography>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderTabIndicator = () => {
    if (variant === 'filled' || variant === 'pill' || !animated) {
      return null;
    }

    return (
      <Animated.View
        style={[
          styles.indicator,
          getIndicatorStyle(variant),
          {
            transform: [{translateX: indicatorAnimation}],
            width: indicatorWidthAnimation,
          },
          indicatorStyle,
        ]}
        testID={`${testID}-indicator`}
      />
    );
  };

  const renderTabs = () => {
    if (scrollable && items.length > 1) {
      return (
        <ScrollView
          ref={scrollViewRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={[getTabsContainerStyle(variant, align)]}
          testID={`${testID}-scroll-container`}>
          {items.map(renderTab)}
          {renderTabIndicator()}
        </ScrollView>
      );
    }

    return (
      items.length > 0 && (
        <View
          style={[styles.tabsContainer, getTabsContainerStyle(variant, align)]}
          testID={`${testID}-container`}>
          {items.map(renderTab)}
          {renderTabIndicator()}
        </View>
      )
    );
  };

  const renderContent = () => {
    if (items.length === 0) {
      return null;
    }
    const activeItem = items.find(item => item.key === activeKey);
    if (!activeItem?.content) {
      return null;
    }

    return (
      <View
        style={[styles.contentContainer, contentContainerStyle]}
        testID={`${testID}-content`}>
        {activeItem.content}
      </View>
    );
  };

  return (
    <View style={[styles.container, containerStyle]} testID={testID}>
      {position === 'top' && renderTabs()}
      {renderContent()}
      {position === 'bottom' && renderTabs()}
    </View>
  );
};

// Utility functions for styles
const getTabStyle = (
  variant: TabVariant,
  size: TabSize,
  isActive: boolean,
  disabled?: boolean,
): ViewStyle[] => {
  const tabStyles: ViewStyle[] = [
    styles.tab,
    styles[`${size}Tab`],
    styles[`${variant}Tab`],
  ];

  if (isActive) {
    tabStyles.push(styles[`${variant}ActiveTab`]);
  }

  if (disabled) {
    tabStyles.push(styles.disabledTab);
  }

  return tabStyles;
};

const getTabsContainerStyle = (
  variant: TabVariant,
  align: TabAlign,
): ViewStyle[] => {
  const containerStyles: ViewStyle[] = [styles.tabsContainer];

  // Add variant container style
  const variantKey = `${variant}Container`;
  if (variantKey in styles) {
    containerStyles.push(styles[variantKey as keyof typeof styles] as ViewStyle);
  }

  // Add alignment style
  const alignmentKey = `align${align.charAt(0).toUpperCase() + align.slice(1)}`;
  if (alignmentKey in styles) {
    containerStyles.push(styles[alignmentKey as keyof typeof styles] as ViewStyle);
  }

  return containerStyles;
};

const getTabContentStyle = (
  iconPosition: 'left' | 'right' | 'top',
): ViewStyle => {
  if (iconPosition === 'top') {
    return styles.tabContentVertical;
  }
  return styles.tabContentHorizontal;
};

const getIconStyle = (
  iconPosition: 'left' | 'right' | 'top',
  showLabel: boolean,
): ViewStyle => {
  if (!showLabel) {
    return {};
  }

  if (iconPosition === 'left') {
    return {marginRight: 8};
  } else if (iconPosition === 'right') {
    return {marginLeft: 8};
  } else if (iconPosition === 'top') {
    return {marginBottom: 4};
  }

  return {};
};

const getIndicatorStyle = (variant: TabVariant): ViewStyle[] => {
  const indicatorStyles: ViewStyle[] = [styles.indicator];

  if (variant === 'underlined') {
    indicatorStyles.push(styles.underlinedIndicator);
  } else if (variant === 'default') {
    indicatorStyles.push(styles.defaultIndicator);
  } else if (variant === 'minimal') {
    indicatorStyles.push(styles.minimalIndicator);
  }

  return indicatorStyles;
};

const getIconSize = (size: TabSize): number => {
  switch (size) {
    case 'small':
      return 16;
    case 'large':
      return 24;
    case 'medium':
    default:
      return 20;
  }
};

const getIconColor = (
  variant: TabVariant,
  isActive: boolean,
  disabled?: boolean,
): string => {
  if (disabled) {
    return styles.disabledTab.opacity.toString();
  }

  return isActive
    ? styles[`${variant}ActiveText`].color
    : styles[`${variant}Text`].color;
};

const getTextColor = (
  variant: TabVariant,
  isActive: boolean,
  disabled?: boolean,
): string => {
  if (disabled) {
    return styles.disabledTab.opacity.toString();
  }

  return isActive
    ? styles[`${variant}ActiveText`].color
    : styles[`${variant}Text`].color;
};

const getTypographyVariant = (size: TabSize): any => {
  switch (size) {
    case 'small':
      return 'caption';
    case 'large':
      return 'subtitle';
    case 'medium':
    default:
      return 'body';
  }
};

// Also export a Tab.Item component for more declarative usage
export interface TabItemProps extends TabItem {
  children?: React.ReactNode;
}

export const Tab: React.FC<TabItemProps> = () => {
  // This component doesn't render anything itself
  // It's just for organizational/TypeScript purposes when used with Tabs
  return null;
};

// Export a TabContent component for more declarative usage
export interface TabContentProps {
  /**
   * Content to render
   */
  children: React.ReactNode;
}

export const TabContent: React.FC<TabContentProps> = () => {
  // This component doesn't render anything itself
  // It's just for organizational/TypeScript purposes when used with Tabs
  return null;
};

// Export a TabPanel component that has both Tabs and Content
export interface TabPanelProps extends Omit<TabsProps, 'items'> {
  /**
   * Children must be Tab components
   */
  children: React.ReactNode;
}

export const TabPanel: React.FC<TabPanelProps> = ({children, ...props}) => {
  // Convert children into items array
  const items: TabItem[] = React.Children.toArray(children)
    .filter(
      (child): child is React.ReactElement<TabItemProps> =>
        React.isValidElement(child) &&
        (child.type === Tab || (child.type as any)?.displayName === 'Tab'),
    )
    .map(child => ({
      ...child.props,
      content: child.props.children,
    }));

  return <Tabs items={items} {...props} />;
};

// Set display names for better debugging
Tab.displayName = 'Tab';
TabContent.displayName = 'TabContent';
TabPanel.displayName = 'TabPanel';
