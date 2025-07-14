import React, {useRef, useCallback} from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  Platform,
  Image,
  ImageSourcePropType,
} from 'react-native';
import Carousel from 'react-native-snap-carousel';
import {SafeAreaView, useSafeAreaInsets} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import {Button, Title, Body, Typography} from '@components';
import {AuthScreenNavigationProp} from '@navigation/types/navigationTypes';
import {useFirstTimeCheck} from '@navigation/utils/navigationUtils';
import {colors, spacing, radius, commonStyles} from '@theme';
import {useTranslation} from '@hooks/useTranslation';

const {width: screenWidth} = Dimensions.get('window');

// Define carousel item interface
interface CarouselItem {
  id: number;
  titleKey: string;
  textKey: string;
  color: string;
  image?: ImageSourcePropType;
}

// Carousel Item Component
const CarouselItemComponent = ({item}: {item: CarouselItem}) => {
  const {t} = useTranslation();

  return (
    <View key={item.id} style={styles.slide}>
      <View style={[styles.imageContainer, {backgroundColor: item.color}]}>
        {item.image ? (
          <Image
            source={item.image}
            style={styles.image}
            resizeMode="contain"
          />
        ) : (
          <Typography
            variant="title"
            color={colors.neutral.white}
            align="center"
            style={styles.imageText}>
            {t(item.titleKey)}
          </Typography>
        )}
      </View>
      <Title style={styles.title}>{t(item.titleKey)}</Title>
      <Body style={styles.text}>{t(item.textKey)}</Body>
    </View>
  );
};

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
}: ButtonSectionProps) => {
  const {t} = useTranslation();

  return (
    <View
      style={[
        styles.buttonContainer,
        {
          paddingBottom: bottomPadding,
        },
      ]}>
      <Button
        title={t('screens.welcome.sign_up')}
        onPress={onSignupPress}
        variant="primary"
        shape="round"
        style={styles.button}
        testID="welcome-signup-button"
      />
      <Button
        title={t('screens.welcome.sign_in')}
        onPress={onSigninPress}
        variant="outline"
        shape="round"
        style={styles.button}
        testID="welcome-signin-button"
      />
    </View>
  );
};

export function WelcomeScreen(): React.JSX.Element {
  const carouselRef = useRef(null);
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<AuthScreenNavigationProp<'Welcome'>>();
  const {markAsNotFirstTime} = useFirstTimeCheck();

  // Carousel data - moved outside component to avoid recreation on each render
  const carouselItems: CarouselItem[] = [
    {
      id: 1,
      titleKey: 'navigation.welcome',
      textKey: 'screens.welcome.slides.discover_community',
      color: '#2E64E5',
    },
    {
      id: 2,
      titleKey: 'screens.welcome.slides.join_events',
      textKey: 'screens.welcome.slides.join_events',
      color: '#4CAF50',
    },
    {
      id: 3,
      titleKey: 'screens.welcome.slides.create_groups',
      textKey: 'screens.welcome.slides.share_experiences',
      color: '#FF9800',
    },
  ];

  // Event Handlers - memoized with useCallback
  const handleSignin = useCallback(async () => {
    await markAsNotFirstTime();
    navigation.replace('Signin');
  }, [navigation, markAsNotFirstTime]);

  const handleSignup = useCallback(async () => {
    await markAsNotFirstTime();
    navigation.replace('Signup');
  }, [navigation, markAsNotFirstTime]);

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
            loop={true}
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
    ...commonStyles.container,
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
  buttonContainer: {
    paddingHorizontal: spacing.screen.horizontal,
  },
  button: {
    marginVertical: spacing.sm,
  },
});
