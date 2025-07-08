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
import {AuthHooks} from '@services/auth.service';
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
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const {height} = useWindowDimensions();
  const {handleGraphQLError} = useGraphQLErrorHandler();

  const {updatePassword, loading} = AuthHooks.useUpdatePassword(() => {
    // Reset form after successful submission
    reset();

    // Navigate to sign in screen after successful password update
    setTimeout(() => {
      navigation.navigate('Signin');
    }, 1500);
  });

  const {
    control,
    handleSubmit,
    formState: {errors},
    setError,
    reset,
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
      // Use the new hook-based updatePassword function
      await updatePassword(formValues.password);
    } catch (error) {
      await handleGraphQLError(error as any);
      setError('password', {
        type: 'manual',
        message: 'Failed to update password. Please try again.',
      });
    }
  }

  return (
    <View style={styles.container}>
      <TopHeaderBar
        showBackButton={false}
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
                  loading={loading}
                  disabled={loading}
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
});
