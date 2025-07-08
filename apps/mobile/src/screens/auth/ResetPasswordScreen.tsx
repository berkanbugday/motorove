import React from 'react';
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
  Caption,
} from '@components';
import {ResetPasswordFormValues, resetPasswordSchema} from '@utils/validation';
import {useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {colors} from '@theme/colors';
import {spacing} from '@theme/spacing';
import {useResetPassword} from '@services/auth.service';
import {loggingService} from '@services/logging.service';

export const ResetPasswordScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const {height} = useWindowDimensions();
  const {resetPassword, loading} = useResetPassword(() => {
    // Reset form after successful submission
    reset();
  });

  const {
    control,
    handleSubmit,
    formState: {errors},
    reset,
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

  const onSubmit = async (
    formValues: ResetPasswordFormValues,
  ): Promise<void> => {
    try {
      // Use the new hook-based resetPassword function
      await resetPassword(formValues.email);
    } catch (error) {
      loggingService.error('Error in onSubmit:', error);
      // Error handling is now done in the hook
    }
  };

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
                  onPress={handleSubmit(onSubmit)}
                  loading={loading}
                  disabled={loading}
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
    paddingHorizontal: spacing.md,
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
  },
  linkButton: {
    color: colors.neutral.black,
    marginLeft: -20,
    textDecorationLine: 'underline',
  },
});
