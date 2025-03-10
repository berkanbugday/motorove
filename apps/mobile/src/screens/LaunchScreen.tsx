import React, {useEffect, useCallback, useMemo} from 'react';
import {
  View,
  StyleSheet,
  Animated,
  Dimensions,
  Platform,
  StatusBar,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';

const {width} = Dimensions.get('window');

export const LaunchScreen: React.FC = () => {
  // Animation values
  const logoScale = useMemo(() => new Animated.Value(1), []);
  const logoOpacity = useMemo(() => new Animated.Value(0), []);

  useEffect(() => {
    // Pulse animation
    const pulseAnimation = Animated.sequence([
      Animated.timing(logoScale, {
        toValue: 1.05,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(logoScale, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]);

    // Fade in and start pulsing
    Animated.sequence([
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.loop(pulseAnimation),
    ]).start();
  }, [logoOpacity, logoScale]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={styles.container.backgroundColor}
      />
      <View style={styles.content}>
        {/* Logo Container */}
        <Animated.View
          style={[
            styles.logoContainer,
            {
              opacity: logoOpacity,
              transform: [{scale: logoScale}],
            },
          ]}>
          {/* Strava-like logo shape */}
          <View style={styles.logoWrapper}>
            <View style={styles.logoShape}>
              <View style={styles.trianglePart} />
              <View style={[styles.trianglePart, styles.triangleRight]} />
            </View>
          </View>
          <Animated.Text style={[styles.brandName, {opacity: logoOpacity}]}>
            motorove
          </Animated.Text>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FC4C02', // Strava's signature orange color
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
  },
  logoWrapper: {
    width: width * 0.25,
    height: width * 0.25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  logoShape: {
    width: '100%',
    height: '100%',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  trianglePart: {
    position: 'absolute',
    width: '60%',
    height: '70%',
    backgroundColor: '#FFFFFF',
    transform: [{rotate: '30deg'}],
  },
  triangleRight: {
    transform: [{rotate: '-30deg'}],
  },
  brandName: {
    fontSize: 32,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: 1,
    textTransform: 'lowercase',
  },
});
