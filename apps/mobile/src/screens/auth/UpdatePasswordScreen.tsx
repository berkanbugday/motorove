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
} from '@components';
import {useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {z} from 'zod';
import {colors} from '@theme/colors';
import {spacing} from '@theme/spacing';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import authService from '@services/auth.service';
import {useGraphQLErrorHandler} from '@hooks/useGraphQLErrorHandler';

// Password update form schema
const updatePasswordSchema = z
  .object({
    password: z
      .string({required_error: 'Password is required'})
      .nonempty('Password is required')
      .min(6, 'Password must be at least 6 characters'),
    confirmPassword: z
      .string({required_error: 'Please confirm your password'})
      .nonempty('Please confirm your password'),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type UpdatePasswordFormValues = z.infer<typeof updatePasswordSchema>;

export const UpdatePasswordScreen = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const {height} = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const {handleGraphQLError} = useGraphQLErrorHandler();

  const {
    control,
    handleSubmit,
    formState: {errors, isSubmitting},
    setError,
  } = useForm<UpdatePasswordFormValues>({
    resolver: zodResolver(updatePasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  function handleGoBack(): void {
    navigation.goBack();
  }

  function handleSigninPress(): void {
    navigation.navigate('Signin');
  }

  function togglePasswordVisibility(): void {
    setShowPassword(!showPassword);
  }

  function toggleConfirmPasswordVisibility(): void {
    setShowConfirmPassword(!showConfirmPassword);
  }

  async function handleUpdatePassword(
    formValues: UpdatePasswordFormValues,
  ): Promise<void> {
    try {
      // Use the authService to update the password
      await authService.updatePassword(formValues.password);
      setIsSuccess(true);
    } catch (error) {
      await handleGraphQLError(error as any);
      setError('password', {
        type: 'manual',
        message: 'Failed to update password. Please try again.',
      });
    }
  }

  // Success view
  if (isSuccess) {
    return (
      <SafeAreaView style={[styles.container, {paddingTop: insets.top}]}>
        <View style={styles.content}>
          <Title align="center" style={styles.title}>
            Password Updated
          </Title>
          <View style={styles.successContainer}>
            <Icon
              name="check-filled"
              size={60}
              color={colors.status.successDark}
            />
            <Body align="center" style={styles.successText}>
              Your password has been successfully updated. You can now sign in
              with your new password.
            </Body>
          </View>
          <Button
            title="Sign In"
            variant="primary"
            shape="round"
            onPress={handleSigninPress}
            style={{marginVertical: spacing.sm}}
            testID="back-to-signin-button"
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
                Update Password
              </Title>
              <Body
                align="center"
                color={colors.neutral.grey}
                style={styles.subtitle}>
                Enter your new password below
              </Body>

              <View style={styles.form}>
                <AnimatedInput
                  control={control}
                  name="password"
                  label="New Password"
                  secureTextEntry={!showPassword}
                  icon={<Icon name="lock-filled" size={20} />}
                  error={errors.password}
                  onToggleSecureEntry={togglePasswordVisibility}
                  showPassword={showPassword}
                  testID="update-password-new"
                  showClearButton={false}
                />

                <AnimatedInput
                  control={control}
                  name="confirmPassword"
                  label="Confirm Password"
                  secureTextEntry={!showConfirmPassword}
                  icon={<Icon name="lock-filled" size={20} />}
                  error={errors.confirmPassword}
                  onToggleSecureEntry={toggleConfirmPasswordVisibility}
                  showPassword={showConfirmPassword}
                  testID="update-password-confirm"
                  showClearButton={false}
                />

                <Button
                  title="Update Password"
                  shape="round"
                  onPress={handleSubmit(handleUpdatePassword)}
                  loading={isSubmitting}
                  disabled={isSubmitting}
                  style={styles.resetButton}
                  testID="update-password-button"
                />
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
  successText: {
    marginTop: spacing.md,
    textAlign: 'center',
  },
});
