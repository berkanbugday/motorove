import React, {useEffect, useState} from 'react';
import {Animated, StyleSheet, Text} from 'react-native';
import {networkService} from '@services/network.service';
import {colors} from '@theme/colors';

interface Props {
  offlineMessage?: string;
  offlineBackgroundColor?: string;
  offlineTextColor?: string;
}

/**
 * Component that displays a banner when the device goes offline
 */
const NetworkStatusBar: React.FC<Props> = ({
  offlineMessage = 'No internet connection',
  offlineBackgroundColor = colors.status.warning,
  offlineTextColor = colors.neutral.black,
}) => {
  // Initialize animation value for the network status banner
  const [animation] = useState(new Animated.Value(0));

  useEffect(() => {
    // Subscribe to network status changes
    const unsubscribe = networkService.addListener(connected => {
      // Animate banner in or out
      Animated.timing(animation, {
        toValue: connected ? 0 : 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    });

    // Cleanup subscription
    return unsubscribe;
  }, [animation]);

  // Calculate translateY based on animation value
  const translateY = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [-50, 0], // Start offscreen (-50) and animate to visible (0)
  });

  // Calculate opacity based on animation value
  const opacity = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: offlineBackgroundColor,
          transform: [{translateY}],
          opacity,
        },
      ]}>
      <Text style={[styles.text, {color: offlineTextColor}]}>
        {offlineMessage}
      </Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingTop: 50,
    paddingBottom: 10,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  text: {
    fontWeight: 'bold',
  },
});

export default NetworkStatusBar;
