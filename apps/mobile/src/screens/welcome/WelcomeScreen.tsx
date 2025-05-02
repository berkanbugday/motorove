import React, {useState, useRef, useCallback} from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  Platform,
  Image,
  ImageSourcePropType,
} from 'react-native';
import Carousel, {Pagination} from 'react-native-snap-carousel';
import {SafeAreaView, useSafeAreaInsets} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import {Button, Title, Body, Typography} from '@components';
import {AuthScreenNavigationProp} from '@navigation/types/navigationTypes';
import {useFirstTimeCheck} from '@navigation/utils/navigationUtils';
import {colors, spacing, radius} from '@theme';

const {width: screenWidth} = Dimensions.get('window');

// Define carousel item interface
interface CarouselItem {
  id: number;
  title: string;
  text: string;
  color: string;
  image?: ImageSourcePropType;
}

// Carousel data - moved outside component to avoid recreation on each render
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

// Carousel Item Component
const CarouselItemComponent = ({item}: {item: CarouselItem}) => (
  <View style={styles.slide}>
    <View style={[styles.imageContainer, {backgroundColor: item.color}]}>
      {item.image ? (
        <Image source={item.image} style={styles.image} resizeMode="contain" />
      ) : (
        <Typography
          variant="title"
          color="#FFFFFF"
          align="center"
          style={styles.imageText}>
          {item.title}
        </Typography>
      )}
    </View>
    <Title style={styles.title}>{item.title}</Title>
    <Body style={styles.text}>{item.text}</Body>
  </View>
);

// Button Section Component
type ButtonSectionProps = {
  onSigninPress: () => void;
  onSignupPress: () => void;
  bottomPadding: number;
};

const ButtonSection = ({
  onSigninPress,
  onSignupPress,
  bottomPadding,
}: ButtonSectionProps) => (
  <View
    style={[
      styles.buttonContainer,
      {
        paddingBottom: bottomPadding,
      },
    ]}>
    <Button
      title="Sign Up"
      onPress={onSignupPress}
      variant="primary"
      shape="round"
      style={styles.button}
      testID="welcome-signup-button"
    />
    <Button
      title="Sign In"
      onPress={onSigninPress}
      variant="outline"
      shape="round"
      style={styles.button}
      testID="welcome-signin-button"
    />
  </View>
);

export function WelcomeScreen(): React.JSX.Element {
  const [activeSlide, setActiveSlide] = useState(0);
  const carouselRef = useRef(null);
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<AuthScreenNavigationProp<'Welcome'>>();
  const {markAsNotFirstTime} = useFirstTimeCheck();

  // Event Handlers - memoized with useCallback
  const handleSignin = useCallback(async () => {
    await markAsNotFirstTime();
    navigation.replace('Signin', {mode: 'signin'});
  }, [navigation, markAsNotFirstTime]);

  const handleSignup = useCallback(async () => {
    await markAsNotFirstTime();
    navigation.replace('Signup');
  }, [navigation, markAsNotFirstTime]);

  // Handle carousel snap
  const handleSnapToItem = useCallback((index: number) => {
    setActiveSlide(index);
  }, []);

  // Calculate bottom padding for button container
  const bottomPadding = Math.max(
    insets.bottom,
    Platform.OS === 'ios' ? 20 : 16,
  );

  return (
    <SafeAreaView
      style={styles.container}
      edges={['top', 'bottom', 'left', 'right']}>
      <View style={styles.contentContainer}>
        <View style={styles.carouselContainer}>
          <Carousel
            ref={carouselRef}
            data={carouselItems}
            renderItem={({item}) => <CarouselItemComponent item={item} />}
            sliderWidth={screenWidth}
            itemWidth={screenWidth - 60}
            onSnapToItem={handleSnapToItem}
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

        <ButtonSection
          onSigninPress={handleSignin}
          onSignupPress={handleSignup}
          bottomPadding={bottomPadding}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral.background,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: spacing.screen.vertical,
  },
  carouselContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  slide: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
  },
  imageContainer: {
    width: screenWidth - 80,
    height: screenWidth - 80,
    borderRadius: radius.lg,
    marginBottom: spacing.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '80%',
    height: '80%',
  },
  imageText: {
    color: colors.neutral.white,
  },
  title: {
    color: colors.neutral.darkGrey,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  text: {
    color: colors.neutral.grey,
    textAlign: 'center',
  },
  paginationDot: {
    width: 25,
    height: 10,
    borderRadius: radius.round,
    backgroundColor: colors.neutral.black,
  },
  paginationInactiveDot: {
    width: 10,
    backgroundColor: colors.neutral.lightGrey,
  },
  buttonContainer: {
    paddingHorizontal: spacing.screen.horizontal,
  },
  button: {
    marginVertical: spacing.sm,
  },
});
