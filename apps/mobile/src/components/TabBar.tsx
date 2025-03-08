import React from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  ViewStyle,
  Dimensions,
  LayoutChangeEvent,
} from 'react-native';
import {View, Text} from 'react-native-ui-lib';

interface TabBarProps {
  items: string[];
  selectedIndex: number;
  onTabPress: (index: number) => void;
  style?: ViewStyle;
}

const SCREEN_WIDTH = Dimensions.get('window').width;
const HORIZONTAL_PADDING = 16;
const MIN_TAB_WIDTH = 90;

export function TabBar({items, selectedIndex, onTabPress, style}: TabBarProps) {
  const scrollViewRef = React.useRef<ScrollView>(null);
  const [tabWidths, setTabWidths] = React.useState<number[]>([]);
  const [containerWidth, setContainerWidth] = React.useState(0);

  const translateX = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (tabWidths.length > 0) {
      const position = tabWidths
        .slice(0, selectedIndex)
        .reduce((sum, width) => sum + width, 0);

      Animated.spring(translateX, {
        toValue: position,
        useNativeDriver: true,
        tension: 120,
        friction: 8,
      }).start();

      // Scroll to the selected tab
      scrollViewRef.current?.scrollTo({
        x: Math.max(0, position - SCREEN_WIDTH / 3),
        animated: true,
      });
    }
  }, [selectedIndex, tabWidths, translateX]);

  const handleLayout = (event: LayoutChangeEvent) => {
    const {width} = event.nativeEvent.layout;
    setContainerWidth(width);
  };

  const calculateTabWidth = (text: string) => {
    // If all tabs fit in screen, distribute space evenly
    const totalTabs = items.length;
    const availableWidth = containerWidth || SCREEN_WIDTH;
    const evenWidth = availableWidth / totalTabs;

    if (evenWidth >= MIN_TAB_WIDTH) {
      return evenWidth;
    }

    // Otherwise, calculate based on text length with minimum width
    const baseWidth = Math.max(
      MIN_TAB_WIDTH,
      text.length * 12 + HORIZONTAL_PADDING,
    );
    return baseWidth;
  };

  const handleTabLayout = (index: number, event: LayoutChangeEvent) => {
    const {width} = event.nativeEvent.layout;
    setTabWidths(prev => {
      const newWidths = [...prev];
      newWidths[index] = width;
      return newWidths;
    });
  };

  return (
    <View style={[styles.container, style]} onLayout={handleLayout}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}>
        <View style={styles.tabBar}>
          {items.map((item, index) => (
            <TouchableOpacity
              key={item}
              style={[styles.tab, {width: calculateTabWidth(item)}]}
              onLayout={e => handleTabLayout(index, e)}
              onPress={() => onTabPress(index)}>
              <Text
                style={[
                  styles.tabText,
                  selectedIndex === index && styles.selectedTabText,
                ]}>
                {item}
              </Text>
            </TouchableOpacity>
          ))}
          <Animated.View
            style={[
              styles.indicator,
              {
                width: tabWidths[selectedIndex] || MIN_TAB_WIDTH,
                transform: [{translateX}],
              },
            ]}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: 1,
    borderBottomColor: '#E1E1E1',
  },
  tabBar: {
    flexDirection: 'row',
    height: 48,
    position: 'relative',
  },
  tab: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: HORIZONTAL_PADDING,
  },
  indicator: {
    position: 'absolute',
    bottom: 0,
    height: 2,
    backgroundColor: '#007AFF',
  },
  tabText: {
    fontSize: 16,
    color: '#8E8E93',
  },
  selectedTabText: {
    color: '#007AFF',
    fontWeight: '600',
  },
});
