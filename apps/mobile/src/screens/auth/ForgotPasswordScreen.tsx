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
  useWindowDimensions,
  TextStyle,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {Icon, AnimatedInput, Button, Header} from '@components/index';
import {
  ForgotPasswordFormValues,
  forgotPasswordSchema,
} from '@utils/validation';
import {useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {colors} from '@theme/colors';
import {typography} from '@theme/typography';
import {spacing} from '@theme/spacing';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

export function ForgotPasswordScreen() {
  const [emailSent, setEmailSent] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const {height} = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const {
    control,
    handleSubmit,
    formState: {errors, isSubmitting},
    setError,
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  function handleGoBack() {
    navigation.goBack();
  }

  function handleLoginPress() {
    navigation.navigate('Login');
  }

  function handleSupportPress() {
    // Navigate to support or open support contact options
    navigation.navigate('Support');
  }

  async function handleResetPassword() {
    handleSubmit(async formValues => {
      try {
        // TODO: Implement actual password reset with Supabase
        // Example: const { error } = await supabase.auth.resetPasswordForEmail(formValues.email);

        // For demo purposes, simulate success after a delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Store email for confirmation screen
        setUserEmail(formValues.email);

        // Set email sent flag to show confirmation view
        setEmailSent(true);
      } catch (error) {
        setError('email', {
          type: 'manual',
          message: 'Failed to send reset email. Please try again.',
        });
      }
    })();
  }

  // View when email has been sent
  if (emailSent) {
    return (
      <SafeAreaView style={[styles.safeArea, {paddingTop: insets.top}]}>
        <View style={styles.content}>
          <Text style={styles.title}>Check your email</Text>
          <View style={styles.successContainer}>
            <Icon name="envelope" size={60} color={colors.status.success} />
            <Text style={styles.successTitle}>We've sent a email to</Text>
            <Text style={styles.emailText}>{userEmail}</Text>
            <Text style={styles.successText}>
              If you don't see the email, please check your spam folder
            </Text>
          </View>
          <Button
            title="Resend Reset Link"
            variant="primary"
            shape="round"
            onPress={handleResetPassword}
            style={{marginBottom: spacing.sm}}
            testID="resend-reset-link-button"
          />

          <Button
            title="Back to Login"
            variant="outline"
            shape="round"
            onPress={handleLoginPress}
            testID="back-to-login-button"
          />
        </View>
      </SafeAreaView>
    );
  }

  // Reset password form view
  return (
    <View style={styles.container}>
      <Header
        showBackButton
        includeStatusBar={true}
        onBackPress={handleGoBack}
      />
      <SafeAreaView style={[styles.safeArea, {paddingTop: insets.top}]}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled">
            <View style={[styles.content, {minHeight: height * 0.75}]}>
              <View style={styles.logoContainer}>
                <Image
                  source={require('@assets/images/motorove_logo_dark.png')}
                  style={styles.logo}
                  resizeMode="contain"
                />
              </View>

              <Text style={styles.title}>Reset your password</Text>
              <Text style={styles.subtitle}>
                Enter your email address and we'll send you instructions to
                reset your password.
              </Text>

              <View style={styles.form}>
                <AnimatedInput
                  control={control}
                  name="email"
                  label="Email Address"
                  keyboardType="email-address"
                  icon={<Icon name="envelope" size={20} />}
                  error={errors.email}
                  testID="forgot-password-email"
                />

                <Button
                  title="Send Reset Link"
                  shape="round"
                  onPress={handleResetPassword}
                  loading={isSubmitting}
                  disabled={isSubmitting}
                  style={styles.resetButton}
                  testID="send-reset-button"
                />

                <Button
                  title="Remember your password? Login"
                  variant="text"
                  onPress={handleLoginPress}
                  style={styles.linkContainer}
                  testID="back-to-login-button"
                />

                <Button
                  title="Need help? Contact Support"
                  variant="text"
                  onPress={handleSupportPress}
                  style={styles.linkContainer}
                  testID="contact-support-button"
                />

                <Text style={styles.securityNotice}>
                  For your security, a password reset link will be sent to your
                  registered email address. The link will expire in 24 hours.
                </Text>
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
  safeArea: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
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
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
  },
  logo: {
    width: 180,
    height: 60,
  },
  title: {
    ...(typography.title as TextStyle),
    color: colors.neutral.black,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  subtitle: {
    ...(typography.body as TextStyle),
    color: colors.neutral.grey,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  form: {
    width: '100%',
  },
  resetButton: {
    marginTop: spacing.md,
    backgroundColor: colors.primary.main,
  },
  linkContainer: {
    marginTop: spacing.md,
  },
  securityNotice: {
    ...(typography.caption as TextStyle),
    color: colors.neutral.grey,
    marginTop: spacing.lg,
    textAlign: 'center',
  },
  successContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  successTitle: {
    ...(typography.body as TextStyle),
    color: colors.neutral.black,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  emailText: {
    ...(typography.body as TextStyle),
    fontWeight: '700',
    color: colors.neutral.black,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  successText: {
    ...(typography.bodySmall as TextStyle),
    color: colors.neutral.grey,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
});
