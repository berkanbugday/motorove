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
  TopHeaderBar,
  Title,
  Body,
  BodySmall,
  Caption,
} from '@components';
import {ResetPasswordFormValues, resetPasswordSchema} from '@utils/validation';
import {useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {colors} from '@theme/colors';
import {spacing} from '@theme/spacing';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import authService from '@services/auth.service';
import {useGraphQLErrorHandler} from '@hooks/useGraphQLErrorHandler';

export const ResetPasswordScreen = () => {
  const [emailSent, setEmailSent] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const {height} = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const {handleGraphQLError} = useGraphQLErrorHandler();

  const {
    control,
    handleSubmit,
    formState: {errors, isSubmitting},
    setError,
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  function handleGoBack(): void {
    navigation.goBack();
  }

  function handleSigninPress(): void {
    navigation.navigate('Signin');
  }

  function handleSupportPress(): void {
    // Navigate to support or open support contact options
    navigation.navigate('Support');
  }

  async function handleResetPassword(): Promise<void> {
    handleSubmit(async formValues => {
      try {
        // Use the authService to send reset password request
        await authService.resetPassword(formValues.email);

        // Store email for confirmation screen
        setUserEmail(formValues.email);

        // Set email sent flag to show confirmation view
        setEmailSent(true);
      } catch (error) {
        await handleGraphQLError(error as any);
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
            <Icon
              name="envelope-filled"
              size={60}
              color={colors.status.successDark}
            />
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
            title="Back to Sign In"
            variant="outline"
            shape="round"
            onPress={handleSigninPress}
            style={{marginVertical: spacing.sm}}
            testID="back-to-signin-button"
          />
        </View>
      </SafeAreaView>
    );
  }

  // Reset password form view
  return (
    <View style={styles.container}>
      <TopHeaderBar
        showBackButton
        showShadow={false}
        includeStatusBar={true}
        onBackPress={handleGoBack}
      />
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}>
          <ScrollView keyboardShouldPersistTaps="handled">
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
                  icon={<Icon name="envelope-filled" size={20} />}
                  error={errors.email}
                  testID="reset-password-email"
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

                <View>
                  <View style={styles.linkContainer}>
                    <Body color={colors.neutral.grey}>
                      Remember your password?
                    </Body>
                    <Button
                      title="Sign In"
                      variant="text"
                      onPress={handleSigninPress}
                      textStyle={styles.linkButton}
                      testID="signin-link"
                    />
                  </View>

                  <View style={styles.linkContainer}>
                    <Body color={colors.neutral.grey}>Need help? </Body>
                    <Button
                      title="Contact Support"
                      variant="text"
                      onPress={handleSupportPress}
                      textStyle={styles.linkButton}
                      testID="support-link"
                    />
                  </View>

                  <Caption align="center" color={colors.neutral.grey}>
                    For your security, a password reset link will be sent to
                    your registered email address. The link will expire in 24
                    hours.
                  </Caption>
                </View>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral.white,
  },
  keyboardView: {
    flex: 1,
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
    gap: spacing.lg,
  },
  resetButton: {
    backgroundColor: colors.primary.main,
  },
  successContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: spacing.lg,
  },
  emailText: {
    marginTop: spacing.sm,
    paddingHorizontal: spacing.xl,
  },
  linkContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: spacing.sm,
  },
  linkButton: {
    color: colors.primary.main,
    fontWeight: '600',
  },
});
