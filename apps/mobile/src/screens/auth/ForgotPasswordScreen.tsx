import React, {useState} from 'react';
import {
  StyleSheet,
  View,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  SafeAreaView,
  Image,
  useWindowDimensions,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {
  Icon,
  AnimatedInput,
  Button,
  Header,
  Title,
  Body,
  BodySmall,
  Caption,
} from '@components';
import {
  ForgotPasswordFormValues,
  forgotPasswordSchema,
} from '@utils/validation';
import {useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {colors} from '@theme/colors';
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
      <SafeAreaView style={[styles.container, {paddingTop: insets.top}]}>
        <View style={styles.content}>
          <Title align="center" style={styles.title}>
            Check your email
          </Title>
          <View style={styles.successContainer}>
            <Icon name="envelope" size={60} color={colors.status.success} />
            <Body>We've sent a email to</Body>
            <Body color={colors.neutral.black} weight="semiBold">
              {userEmail}
            </Body>
            <BodySmall align="center" style={styles.emailText}>
              If you don't see the email, please check your spam folder
            </BodySmall>
          </View>
          <Button
            title="Resend Reset Link"
            variant="primary"
            shape="round"
            onPress={handleResetPassword}
            style={{marginVertical: spacing.sm}}
            testID="resend-reset-link-button"
          />

          <Button
            title="Back to Login"
            variant="outline"
            shape="round"
            onPress={handleLoginPress}
            style={{marginVertical: spacing.sm}}
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
      <SafeAreaView style={{flex: 1}}>
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

              <Title align="center" style={styles.title}>
                Reset your password
              </Title>
              <Body
                align="center"
                color={colors.neutral.grey}
                style={styles.subtitle}>
                Enter your email address and we'll send you instructions to
                reset your password.
              </Body>

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

                <View style={styles.linkContainer}>
                  <Body style={styles.linkText}>Remember your password? </Body>
                  <Button
                    title="Login"
                    variant="text"
                    size="medium"
                    onPress={handleLoginPress}
                    textStyle={styles.linkButton}
                    testID="login-link"
                  />
                </View>

                <View style={styles.linkContainer}>
                  <Body style={styles.linkText}>Need help? </Body>
                  <Button
                    title="Contact Support"
                    variant="text"
                    size="medium"
                    onPress={handleSupportPress}
                    textStyle={styles.linkButton}
                    testID="support-link"
                  />
                </View>

                <Caption
                  align="center"
                  color={colors.neutral.grey}
                  style={styles.securityNotice}>
                  For your security, a password reset link will be sent to your
                  registered email address. The link will expire in 24 hours.
                </Caption>
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
    width: 100,
    height: 100,
  },
  title: {
    marginBottom: spacing.md,
  },
  subtitle: {
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
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  linkText: {
    color: colors.neutral.grey,
  },
  linkButton: {
    color: colors.primary.main,
  },
  securityNotice: {
    marginTop: spacing.lg,
  },
  successContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  emailText: {
    marginBottom: spacing.md,
  },
});
