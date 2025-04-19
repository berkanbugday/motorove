import React, {useState, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Platform,
} from 'react-native';
import Carousel, {Pagination} from 'react-native-snap-carousel';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {SafeAreaView, useSafeAreaInsets} from 'react-native-safe-area-context';

const {width: screenWidth} = Dimensions.get('window');

interface CarouselItem {
  id: number;
  title: string;
  text: string;
  color: string;
}

const carouselItems: CarouselItem[] = [
  {
    id: 1,
    title: 'Welcome to Motorove',
    text: 'Your ultimate motorcycle companion',
    color: '#2E64E5',
  },
  {
    id: 2,
    title: 'Discover Routes',
    text: 'Find the best routes for your rides',
    color: '#4CAF50',
  },
  {
    id: 3,
    title: 'Join Community',
    text: 'Connect with fellow riders',
    color: '#FF9800',
  },
];

function WelcomeScreen(): React.JSX.Element {
  const [activeSlide, setActiveSlide] = useState(0);
  const carouselRef = useRef(null);
  const insets = useSafeAreaInsets();

  const renderCarouselItem = ({item}: {item: CarouselItem}) => {
    return (
      <View style={styles.slide}>
        <View style={[styles.imageContainer, {backgroundColor: item.color}]}>
          <Text style={styles.imageText}>{item.title}</Text>
        </View>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.text}>{item.text}</Text>
      </View>
    );
  };

  const handleLogin = () => {
    // Mark as not first time user
    AsyncStorage.setItem('isFirstTime', 'false');
    console.log('Navigate to Login');
  };

  const handleSignup = () => {
    // Mark as not first time user
    AsyncStorage.setItem('isFirstTime', 'false');
    console.log('Navigate to Signup');
  };

  return (
    <SafeAreaView
      style={styles.container}
      edges={['top', 'bottom', 'left', 'right']}>
      <View style={styles.contentContainer}>
        <View style={styles.carouselContainer}>
          <Carousel
            ref={carouselRef}
            data={carouselItems}
            renderItem={renderCarouselItem}
            sliderWidth={screenWidth}
            itemWidth={screenWidth - 60}
            onSnapToItem={(index: number) => setActiveSlide(index)}
            useScrollView={true}
            loop={false}
          />
          <Pagination
            dotsLength={carouselItems.length}
            activeDotIndex={activeSlide}
            dotStyle={styles.paginationDot}
            inactiveDotStyle={styles.paginationInactiveDot}
            inactiveDotOpacity={0.5}
            inactiveDotScale={0.7}
            animatedFriction={3}
            animatedTension={100}
          />
        </View>
        <View
          style={[
            styles.buttonContainer,
            {
              paddingBottom: Math.max(
                insets.bottom,
                Platform.OS === 'ios' ? 20 : 16,
              ),
            },
          ]}>
          <TouchableOpacity
            style={[styles.button, styles.signupButton]}
            onPress={handleSignup}>
            <Text style={styles.signupButtonText}>Sign Up</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.loginButton]}
            onPress={handleLogin}>
            <Text style={styles.loginButtonText}>Login</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 20,
  },
  carouselContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
  },
  slide: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  imageContainer: {
    width: screenWidth - 80,
    height: screenWidth - 80,
    borderRadius: 16,
    marginBottom: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333333',
    textAlign: 'center',
    marginBottom: 10,
  },
  text: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
  },
  paginationDot: {
    width: 25,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#121212',
  },
  paginationInactiveDot: {
    width: 10,
    backgroundColor: '#C4C4C4',
  },
  buttonContainer: {
    paddingHorizontal: 30,
  },
  button: {
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: 'center',
    marginVertical: 8,
  },
  signupButton: {
    backgroundColor: '#FF3B30',
  },
  loginButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#121212',
  },
  signupButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  loginButtonText: {
    color: '#121212',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default WelcomeScreen;
