import React, {useState, useRef} from 'react';
import {
  StyleSheet,
  View,
  Platform,
  SafeAreaView,
  Image,
  ScrollView,
} from 'react-native';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useAuth} from '@navigation/utils/navigationUtils';
import {
  Icon,
  AnimatedInput,
  Button,
  Checkbox,
  Title,
  Body,
  BodySmall,
  Subtitle,
  TopHeaderBar,
} from '@components';
import BottomSheet, {BottomSheetRef} from '@components/BottomSheet/BottomSheet';
import {useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {signupSchema, SignupFormValues} from '@utils/validation';
import {colors, spacing, fontSizes, radius, commonStyles} from '@theme';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {termsOfService, privacyPolicy} from '@constants/legalContent';
import {useGraphQLErrorHandler} from '@hooks/useGraphQLErrorHandler';
import {GraphQLFormattedError} from 'graphql';

export const SignupScreen = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [signupSuccess, setSignupSuccess] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const termsBottomSheetRef = useRef<BottomSheetRef>(null);
  const privacyBottomSheetRef = useRef<BottomSheetRef>(null);
  const {signup} = useAuth();
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const insets = useSafeAreaInsets();
  const {handleGraphQLError} = useGraphQLErrorHandler();
  const {
    control,
    handleSubmit,
    formState: {errors, isSubmitting},
    setError,
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      agreeToTerms: true,
    },
  });

  const handleGoBack = () => {
    navigation.goBack();
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const onSubmit = async (data: SignupFormValues) => {
    try {
      await signup(data.email, data.password, data.firstName, data.lastName);

      setUserEmail(data.email);
      setSignupSuccess(true);
      // Navigate to account setup screen
      navigation.navigate('AccountSetup', {
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
      });
    } catch (error) {
      await handleGraphQLError(error as GraphQLFormattedError);
      // Handle specific error types
      if (error instanceof Error) {
        setError('confirmPassword', {
          type: 'manual',
          message: error.message || 'Registration failed',
        });
      } else {
        setError('confirmPassword', {
          type: 'manual',
          message: 'An unexpected error occurred. Please try again.',
        });
      }
    }
  };

  const handleSignin = () => {
    // Navigate to signin screen
    navigation.navigate('Signin');
  };

  const handleResendVerificationEmail = () => {
    // TODO: Implement actual email verification
  };

  const handleBackToSignup = () => {
    // Navigate to signup screen
    setSignupSuccess(false);
    navigation.navigate('Signup');
  };

  // Social signup is commented out in UI, so this function is not currently used
  // function handleSocialSignup(provider: 'google' | 'apple' | 'facebook') {
  //   // Notify user that social signup is not implemented yet
  //   Alert.alert(
  //     'Not Implemented',
  //     `Social signup with ${provider} is not implemented yet.`,
  //     [{text: 'OK'}],
  //   );
  // }

  const handleTermsPress = () => {
    termsBottomSheetRef.current?.open('full');
  };

  const handlePrivacyPress = () => {
    privacyBottomSheetRef.current?.open('full');
  };

  // View when signup is successful
  if (signupSuccess) {
    return (
      <SafeAreaView style={[styles.container, {paddingTop: insets.top}]}>
        <View style={styles.content}>
          <Title align="center" style={styles.successTitle}>
            Verify your email
          </Title>
          <View style={styles.successContainer}>
            <Icon
              name="envelope-filled"
              size={60}
              color={colors.status.success}
            />
            <Body>We've sent a verification email to</Body>
            <Body color={colors.neutral.black} weight="semiBold">
              {userEmail}
            </Body>
            <BodySmall align="center" style={styles.successText}>
              If you don't see the email, check your spam folder
            </BodySmall>
          </View>
          <Button
            title="Resend Verification Email"
            variant="primary"
            shape="round"
            onPress={handleResendVerificationEmail}
            style={{marginVertical: spacing.sm}}
            testID="resend-verification-email-button"
          />
          <Button
            title="Back to Signup"
            variant="outline"
            shape="round"
            onPress={handleBackToSignup}
            style={{marginVertical: spacing.sm}}
            testID="back-to-signup-button"
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <TopHeaderBar
        showBackButton
        showShadow={false}
        onBackPress={handleGoBack}
      />
      <SafeAreaView style={styles.container}>
        <KeyboardAwareScrollView
          showsVerticalScrollIndicator={false}
          enableOnAndroid={true}
          enableAutomaticScroll={true}
          keyboardShouldPersistTaps="handled">
          <View style={styles.content}>
            <View style={styles.logoContainer}>
              <Image
                source={require('@assets/images/motorove_logo_dark.png')}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>

            <Subtitle
              align="center"
              weight="medium"
              color={colors.neutral.grey}
              style={styles.welcomeText}>
              Create an account to get started
            </Subtitle>

            <View style={styles.form}>
              <AnimatedInput
                control={control}
                name="firstName"
                label="First Name"
                icon={<Icon name="user-filled" size={20} />}
                error={errors.firstName}
                testID="signup-firstname"
              />

              <AnimatedInput
                control={control}
                name="lastName"
                label="Last Name"
                icon={<Icon name="user-filled" size={20} />}
                error={errors.lastName}
                testID="signup-lastname"
              />

              <AnimatedInput
                control={control}
                name="email"
                label="Email Address"
                keyboardType="email-address"
                icon={<Icon name="envelope-filled" size={20} />}
                error={errors.email}
                testID="signup-email"
              />

              <AnimatedInput
                control={control}
                name="password"
                label="Password"
                secureTextEntry={!showPassword}
                error={errors.password}
                onToggleSecureEntry={togglePasswordVisibility}
                showPassword={showPassword}
                testID="signup-password"
                showClearButton={false}
              />

              <AnimatedInput
                control={control}
                name="confirmPassword"
                label="Confirm Password"
                secureTextEntry={!showConfirmPassword}
                error={errors.confirmPassword}
                onToggleSecureEntry={toggleConfirmPasswordVisibility}
                showPassword={showConfirmPassword}
                testID="signup-confirm-password"
                showClearButton={false}
              />

              <Checkbox
                control={control}
                name="agreeToTerms"
                error={errors.agreeToTerms}
                testID="terms-checkbox"
                variant="outline"
                size="medium"
                label={
                  <View style={styles.termsTextContainer}>
                    <BodySmall color={colors.neutral.grey}>
                      I agree to the
                    </BodySmall>
                    <Button
                      title="Terms of Service"
                      variant="text"
                      onPress={handleTermsPress}
                      textStyle={styles.termsLink}
                    />
                    <BodySmall color={colors.neutral.grey}>and</BodySmall>
                    <Button
                      title="Privacy Policy"
                      variant="text"
                      onPress={handlePrivacyPress}
                      textStyle={styles.termsLink}
                    />
                  </View>
                }
              />
              <Button
                title="Sign Up"
                shape="round"
                onPress={handleSubmit(onSubmit)}
                loading={isSubmitting}
                disabled={isSubmitting}
                testID="signup-button"
              />

              {/* <View style={styles.dividerContainer}>
                <View style={styles.divider} />
                <BodySmall
                  color={colors.neutral.grey}
                  style={styles.dividerText}>
                  or continue with
                </BodySmall>
                <View style={styles.divider} />
              </View> */}

              {/* <View style={styles.socialButtonsContainer}>
                <TouchableOpacity
                  style={styles.socialButton}
                  onPress={() => handleSocialSignup('google')}>
                  <Icon
                    name="google"
                    size={18}
                    color={colors.neutral.black}
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.socialButton}
                  onPress={() => handleSocialSignup('apple')}>
                  <Icon name="apple" size={18} color={colors.neutral.black} />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.socialButton}
                  onPress={() => handleSocialSignup('facebook')}>
                  <Icon
                    name="facebook"
                    size={18}
                    color={colors.neutral.black}
                  />
                </TouchableOpacity>
              </View> */}

              <View style={styles.signinContainer}>
                <Body color={colors.neutral.grey}>
                  Already have an account?
                </Body>
                <Button
                  title="Sign In"
                  variant="text"
                  onPress={handleSignin}
                  textStyle={styles.signinLink}
                  testID="signin-button"
                />
              </View>
            </View>
          </View>
        </KeyboardAwareScrollView>
      </SafeAreaView>

      {/* Terms of Service Bottom Sheet */}
      <BottomSheet
        ref={termsBottomSheetRef}
        closeOnBackdropPress
        initialSnap="closed">
        <View style={styles.bottomSheetContent}>
          <Title align="center" style={styles.bottomSheetTitle}>
            Terms of Service
          </Title>
          <ScrollView
            style={styles.legalScrollView}
            contentContainerStyle={styles.legalContentContainer}
            bounces={false}
            showsVerticalScrollIndicator={false}>
            <BodySmall>{termsOfService}</BodySmall>
          </ScrollView>
        </View>
      </BottomSheet>

      {/* Privacy Policy Bottom Sheet */}
      <BottomSheet
        ref={privacyBottomSheetRef}
        closeOnBackdropPress
        initialSnap="closed">
        <View style={styles.bottomSheetContent}>
          <Title align="center" style={styles.bottomSheetTitle}>
            Privacy Policy
          </Title>
          <ScrollView
            style={styles.legalScrollView}
            contentContainerStyle={styles.legalContentContainer}
            bounces={false}
            showsVerticalScrollIndicator={false}>
            <BodySmall>{privacyPolicy}</BodySmall>
          </ScrollView>
        </View>
      </BottomSheet>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...commonStyles.container,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.md,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  logo: {
    width: 100,
    height: 100,
  },
  welcomeText: {
    marginBottom: spacing.xl,
  },
  form: {
    width: '100%',
    gap: spacing.lg,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: colors.neutral.veryLightGrey,
  },
  dividerText: {
    paddingHorizontal: spacing.md,
  },
  socialButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
  },
  socialButton: {
    width: 50,
    height: 50,
    borderRadius: radius.round,
    borderWidth: 1,
    borderColor: colors.neutral.veryLightGrey,
    justifyContent: 'center',
    alignItems: 'center',
  },
  signinContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signinLink: {
    color: colors.neutral.black,
    marginLeft: -20,
    textDecorationLine: 'underline',
  },
  termsTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: spacing.xs,
  },
  termsLink: {
    fontSize: fontSizes.sm,
    textDecorationLine: 'underline',
    marginLeft: -20,
    marginRight: -20,
  },
  bottomSheetContent: {
    flex: 1,
  },
  legalScrollView: {
    flex: 1,
    paddingHorizontal: spacing.md,
  },
  legalContentContainer: {
    paddingVertical: spacing.sm,
  },
  successTitle: {
    marginBottom: spacing.md,
  },
  successContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  successText: {
    marginBottom: spacing.md,
  },
  bottomSheetTitle: {
    marginBottom: spacing.sm,
  },
});
