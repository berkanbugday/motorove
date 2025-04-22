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
import {Icon, AnimatedInput, Button} from '@components';
import {useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {loginSchema, LoginFormValues} from '@utils/validation';
import {colors, spacing, fontSizes, radius} from '@theme';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

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
      const {success, error} = await login(data.email, data.password);

      if (!success && error) {
        setError('password', {
          type: 'manual',
          message: error,
        });
      }
      // If successful, the useAuth hook will update isAuthenticated
      // which will trigger the navigation to switch to MainNavigator
    } catch (error) {
      setError('password', {
        type: 'manual',
        message: 'An unexpected error occurred. Please try again.',
      });
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
    // Handle social login based on provider type
    console.log(`Social login with ${provider}`);
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
                Welcome back! Please login to continue
              </Text>

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
                  <Text style={styles.dividerText}>or continue with</Text>
                  <View style={styles.divider} />
                </View>

                <View style={styles.socialButtonsContainer}>
                  <TouchableOpacity
                    style={styles.socialButton}
                    onPress={() => handleSocialLogin('google')}>
                    <Icon
                      name="google"
                      size={18}
                      color={colors.social.google}
                    />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.socialButton}
                    onPress={() => handleSocialLogin('apple')}>
                    <Icon name="apple" size={18} color={colors.social.apple} />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.socialButton}
                    onPress={() => handleSocialLogin('facebook')}>
                    <Icon
                      name="facebook"
                      size={18}
                      color={colors.social.facebook}
                    />
                  </TouchableOpacity>
                </View>

                <View style={styles.signupContainer}>
                  <Text style={styles.signupText}>Don't have an account? </Text>
                  <TouchableOpacity onPress={handleSignUp}>
                    <Text style={styles.signupLink}>Sign up</Text>
                  </TouchableOpacity>
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
  forgotPasswordContainer: {
    alignSelf: 'flex-end',
    marginBottom: spacing.lg,
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
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.md,
  },
  signupText: {
    color: colors.neutral.grey,
    fontSize: fontSizes.sm,
  },
  signupLink: {
    color: colors.primary.main,
    fontSize: fontSizes.sm,
    fontWeight: '600',
  },
});
