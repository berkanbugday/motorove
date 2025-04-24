import React, {useState, useRef} from 'react';
import {
  StyleSheet,
  View,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  SafeAreaView,
  Image,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native';
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
} from '@components';
import BottomSheet, {BottomSheetRef} from '@components/BottomSheet/BottomSheet';
import {useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {signupSchema, SignupFormValues} from '@utils/validation';
import {colors, spacing, fontSizes, radius} from '@theme';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {termsOfService, privacyPolicy} from '@constants/legalContent';

export function SignupScreen() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [signupSuccess, setSignupSuccess] = useState(false);
  const [userEmail, _setUserEmail] = useState('');
  const termsBottomSheetRef = useRef<BottomSheetRef>(null);
  const privacyBottomSheetRef = useRef<BottomSheetRef>(null);
  const {signup} = useAuth();
  const {height} = useWindowDimensions();
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const insets = useSafeAreaInsets();

  const {
    control,
    handleSubmit,
    formState: {errors, isSubmitting},
    setError,
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      fullName: 'Berkan Buğday',
      email: 'berkan.bugday@gmail.com',
      password: '12345678',
      confirmPassword: '12345678',
      agreeToTerms: true,
    },
  });

  function togglePasswordVisibility() {
    setShowPassword(!showPassword);
  }

  function toggleConfirmPasswordVisibility() {
    setShowConfirmPassword(!showConfirmPassword);
  }

  async function onSubmit(data: SignupFormValues) {
    try {
      const {success, error} = await signup(
        data.fullName,
        data.email,
        data.password,
      );

      if (!success && error) {
        setError('confirmPassword', {
          type: 'manual',
          message: error,
        });
      } else if (success) {
        // // Store email for confirmation screen
        // setUserEmail(data.email);
        // // Set signup success flag to show confirmation view
        // setSignupSuccess(true);

        navigation.navigate('AccountSetup', {
          email: data.email,
          fullName: data.fullName,
        });
      }
      // If successful, the useAuth hook will update isAuthenticated
      // which will trigger the navigation to switch to MainNavigator
    } catch (error) {
      setError('confirmPassword', {
        type: 'manual',
        message: 'An unexpected error occurred. Please try again.',
      });
    }
  }

  function handleLogin() {
    // Navigate to login screen
    navigation.navigate('Login');
  }

  function handleResendVerificationEmail() {
    // TODO: Implement actual email verification
  }

  function handleBackToSignup() {
    // Navigate to signup screen
    setSignupSuccess(false);
    navigation.navigate('Signup');
  }

  function handleSocialSignup(provider: 'google' | 'apple' | 'facebook') {
    // Handle social signup based on provider type
    console.log(`Social signup with ${provider}`);
  }

  function handleTermsPress() {
    termsBottomSheetRef.current?.open('full');
  }

  function handlePrivacyPress() {
    privacyBottomSheetRef.current?.open('full');
  }

  // View when signup is successful
  if (signupSuccess) {
    return (
      <SafeAreaView style={[styles.container, {paddingTop: insets.top}]}>
        <View style={styles.content}>
          <Title align="center" style={styles.successTitle}>
            Verify your email
          </Title>
          <View style={styles.successContainer}>
            <Icon name="envelope" size={60} color={colors.status.success} />
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
      <SafeAreaView style={[styles.container, {paddingTop: insets.top}]}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.container}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled">
            <View style={[styles.content, {minHeight: height * 0.8}]}>
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
                  name="fullName"
                  label="Full Name"
                  icon={<Icon name="user" size={20} />}
                  error={errors.fullName}
                  testID="signup-fullname"
                />

                <AnimatedInput
                  control={control}
                  name="email"
                  label="Email Address"
                  keyboardType="email-address"
                  icon={<Icon name="envelope" size={20} />}
                  error={errors.email}
                  testID="signup-email"
                />

                <AnimatedInput
                  control={control}
                  name="password"
                  label="Password"
                  secureTextEntry={!showPassword}
                  icon={<Icon name="eye-slash" size={20} />}
                  error={errors.password}
                  onToggleSecureEntry={togglePasswordVisibility}
                  showPassword={showPassword}
                  testID="signup-password"
                />

                <AnimatedInput
                  control={control}
                  name="confirmPassword"
                  label="Confirm Password"
                  secureTextEntry={!showConfirmPassword}
                  icon={<Icon name="eye-slash" size={20} />}
                  error={errors.confirmPassword}
                  onToggleSecureEntry={toggleConfirmPasswordVisibility}
                  showPassword={showConfirmPassword}
                  testID="signup-confirm-password"
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
                  style={styles.termsCheckbox}
                />
                <Button
                  title="Sign Up"
                  shape="round"
                  onPress={handleSubmit(onSubmit)}
                  loading={isSubmitting}
                  disabled={isSubmitting}
                  testID="signup-button"
                  style={{marginTop: spacing.md}}
                />

                <View style={styles.dividerContainer}>
                  <View style={styles.divider} />
                  <BodySmall
                    color={colors.neutral.grey}
                    style={styles.dividerText}>
                    or continue with
                  </BodySmall>
                  <View style={styles.divider} />
                </View>

                <View style={styles.socialButtonsContainer}>
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
                </View>

                <View style={styles.loginContainer}>
                  <Body color={colors.neutral.grey}>
                    Already have an account?{' '}
                  </Body>
                  <Button
                    title="Log in"
                    variant="text"
                    onPress={handleLogin}
                    textStyle={styles.loginLink}
                    testID="login-button"
                  />
                </View>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
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
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral.white,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    padding: spacing.screen.horizontal,
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
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginLink: {
    color: colors.primary.main,
  },
  termsCheckbox: {
    marginTop: 0,
    marginRight: 0,
  },
  termsTextContainer: {
    flex: 1,
    marginLeft: spacing.xs,
    flexWrap: 'wrap',
    flexDirection: 'row',
  },
  termsLink: {
    fontSize: fontSizes.sm,
    lineHeight: fontSizes.sm,
    textDecorationLine: 'underline',
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
