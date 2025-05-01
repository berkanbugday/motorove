import React, {useState} from 'react';
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
  Alert,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {Icon, AnimatedInput, Button, Body, Caption} from '@components';
import {useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {loginSchema, LoginFormValues} from '@utils/validation';
import {colors, spacing, radius} from '@theme';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useAuth} from '@navigation/utils/navigationUtils';

export function LoginScreen() {
  const [showPassword, setShowPassword] = useState(false);
  const {login} = useAuth();
  const {height} = useWindowDimensions();
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const insets = useSafeAreaInsets();

  const {
    control,
    handleSubmit,
    formState: {errors, isSubmitting},
    setError,
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  function togglePasswordVisibility() {
    setShowPassword(!showPassword);
  }

  async function onSubmit(data: LoginFormValues) {
    try {
      await login(data.email, data.password);
      // If successful, the navigation in RootNavigator will change to MainNavigator
    } catch (error) {
      // Handle specific error types
      if (error instanceof Error) {
        setError('password', {
          type: 'manual',
          message: error.message || 'Invalid credentials',
        });
      } else {
        setError('password', {
          type: 'manual',
          message: 'An unexpected error occurred. Please try again.',
        });
      }
    }
  }

  function handleSignUp() {
    // Navigate to sign up screen
    navigation.navigate('Signup');
  }

  function handleForgotPassword() {
    navigation.navigate('ForgotPassword');
  }

  function handleSocialLogin(provider: 'google' | 'apple' | 'facebook') {
    // Notify user that social login is not implemented yet
    Alert.alert(
      'Not Implemented',
      `Social login with ${provider} is not implemented yet.`,
      [{text: 'OK'}],
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

              <Body style={styles.welcomeText}>
                Welcome back! Please login to continue
              </Body>

              <View style={styles.form}>
                <AnimatedInput
                  control={control}
                  name="email"
                  label="Email Address"
                  keyboardType="email-address"
                  icon={<Icon name="envelope" size={20} />}
                  error={errors.email}
                  testID="login-email"
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
                  testID="login-password"
                />

                <Button
                  title="Forgot password?"
                  variant="text"
                  size="small"
                  onPress={handleForgotPassword}
                  style={styles.forgotPasswordContainer}
                />

                <Button
                  title="Login"
                  shape="round"
                  onPress={handleSubmit(onSubmit)}
                  loading={isSubmitting}
                  disabled={isSubmitting}
                  testID="login-button"
                />

                <View style={styles.dividerContainer}>
                  <View style={styles.divider} />
                  <Caption style={styles.dividerText}>or continue with</Caption>
                  <View style={styles.divider} />
                </View>

                <View style={styles.socialButtonsContainer}>
                  <TouchableOpacity
                    style={styles.socialButton}
                    onPress={() => handleSocialLogin('google')}>
                    <Icon
                      name="google"
                      size={18}
                      color={colors.neutral.black}
                    />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.socialButton}
                    onPress={() => handleSocialLogin('apple')}>
                    <Icon name="apple" size={18} color={colors.neutral.black} />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.socialButton}
                    onPress={() => handleSocialLogin('facebook')}>
                    <Icon
                      name="facebook"
                      size={18}
                      color={colors.neutral.black}
                    />
                  </TouchableOpacity>
                </View>

                <View style={styles.signupContainer}>
                  <Body color={colors.neutral.grey}>
                    Don't have an account?{' '}
                  </Body>
                  <Button
                    title="Sign up"
                    variant="text"
                    onPress={handleSignUp}
                    textStyle={styles.signupLink}
                    testID="signup-button"
                  />
                </View>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
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
    color: colors.neutral.grey,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  form: {
    width: '100%',
    gap: spacing.lg,
  },
  forgotPasswordContainer: {
    alignSelf: 'flex-end',
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
    color: colors.neutral.grey,
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
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signupLink: {
    color: colors.primary.main,
  },
});
