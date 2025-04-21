import React, {useState} from 'react';
import {
  StyleSheet,
  View,
  Text,
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
import {useAuth} from '@navigation/index';
import {
  Icon,
  AnimatedInput,
  Button,
  Checkbox,
  ContentModal,
} from '@components/index';
import {useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {signupSchema, SignupFormValues} from '@utils/validation';
import {colors, spacing, fontSizes, radius} from '@theme/index';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {termsOfService, privacyPolicy} from '@constants/legalContent';

export function SignupScreen() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [termsModalVisible, setTermsModalVisible] = useState(false);
  const [privacyModalVisible, setPrivacyModalVisible] = useState(false);
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
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
      agreeToTerms: false,
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

  function handleSocialSignup(provider: 'google' | 'apple' | 'facebook') {
    // Handle social signup based on provider type
    console.log(`Social signup with ${provider}`);
  }

  function handleTermsPress() {
    setTermsModalVisible(true);
  }

  function handlePrivacyPress() {
    setPrivacyModalVisible(true);
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

              <Text style={styles.welcomeText}>
                Create an account to get started
              </Text>

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

                <View style={styles.termsContainer}>
                  <Checkbox
                    control={control}
                    name="agreeToTerms"
                    error={errors.agreeToTerms}
                    testID="terms-checkbox"
                    variant="outline"
                    size="medium"
                    style={styles.termsCheckbox}
                  />
                  <View style={styles.termsTextContainer}>
                    <Text style={styles.termsText}>I agree to the</Text>
                    <Button
                      title="Terms of Service"
                      variant="text"
                      onPress={handleTermsPress}
                      textStyle={styles.termsLink}
                    />
                    <Text style={styles.termsText}>and</Text>
                    <Button
                      title="Privacy Policy"
                      variant="text"
                      onPress={handlePrivacyPress}
                      textStyle={styles.termsLink}
                    />
                  </View>
                </View>

                <Button
                  title="Sign Up"
                  shape="round"
                  onPress={handleSubmit(onSubmit)}
                  loading={isSubmitting}
                  disabled={isSubmitting}
                  testID="signup-button"
                />

                <View style={styles.dividerContainer}>
                  <View style={styles.divider} />
                  <Text style={styles.dividerText}>or continue with</Text>
                  <View style={styles.divider} />
                </View>

                <View style={styles.socialButtonsContainer}>
                  <TouchableOpacity
                    style={styles.socialButton}
                    onPress={() => handleSocialSignup('google')}>
                    <Icon
                      name="google"
                      size={18}
                      color={colors.social.google}
                    />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.socialButton}
                    onPress={() => handleSocialSignup('apple')}>
                    <Icon name="apple" size={18} color={colors.social.apple} />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.socialButton}
                    onPress={() => handleSocialSignup('facebook')}>
                    <Icon
                      name="facebook"
                      size={18}
                      color={colors.social.facebook}
                    />
                  </TouchableOpacity>
                </View>

                <View style={styles.loginContainer}>
                  <Text style={styles.loginText}>
                    Already have an account?{' '}
                  </Text>
                  <TouchableOpacity onPress={handleLogin}>
                    <Text style={styles.loginLink}>Log in</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>

      {/* Terms of Service Modal */}
      <ContentModal
        visible={termsModalVisible}
        onClose={() => setTermsModalVisible(false)}
        title="Terms of Service"
        content={termsOfService}
      />

      {/* Privacy Policy Modal */}
      <ContentModal
        visible={privacyModalVisible}
        onClose={() => setPrivacyModalVisible(false)}
        title="Privacy Policy"
        content={privacyPolicy}
      />
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
    justifyContent: 'center',
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
    fontSize: fontSizes.md,
    color: colors.neutral.grey,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  form: {
    width: '100%',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.lg,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: colors.neutral.veryLightGrey,
  },
  dividerText: {
    color: colors.neutral.grey,
    paddingHorizontal: spacing.md,
    fontSize: fontSizes.sm,
  },
  socialButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginBottom: spacing.lg,
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
    marginTop: spacing.md,
  },
  loginText: {
    color: colors.neutral.grey,
    fontSize: fontSizes.sm,
  },
  loginLink: {
    color: colors.primary.main,
    fontSize: fontSizes.sm,
    fontWeight: '600',
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.lg,
    marginTop: spacing.sm,
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
  termsText: {
    color: colors.neutral.grey,
    fontSize: fontSizes.sm,
    lineHeight: fontSizes.sm * 1.5,
  },
  termsLink: {
    fontSize: fontSizes.sm,
    lineHeight: fontSizes.sm,
    textDecorationLine: 'underline',
  },
});
