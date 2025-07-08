import React, {useState, useEffect} from 'react';
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
import {useNavigation, useRoute, RouteProp} from '@react-navigation/native';
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
import {
  UpdatePasswordFormValues,
  updatePasswordSchema,
} from '@utils/validation';
import {colors} from '@theme/colors';
import {spacing} from '@theme/spacing';
import {useUpdatePassword} from '@services/auth.service';
import {loggingService} from '@services/logging.service';

// Define the route params type
type UpdatePasswordParams = {
  email: string;
  token: string;
};

export const UpdatePasswordScreen = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const route =
    useRoute<RouteProp<Record<string, UpdatePasswordParams>, string>>();
  const {height} = useWindowDimensions();

  // Extract email and token from route params
  const email = route.params?.email;
  const token = route.params?.token;

  // Log the received params for debugging
  useEffect(() => {
    if (email && token) {
      loggingService.info('Received password reset params:', {
        email,
        tokenExists: !!token,
      });
    }
  }, [email, token]);

  const {updatePassword, loading} = useUpdatePassword(() => {
    // Reset form after successful submission
    reset();

    // Navigate to sign in screen after successful password update
    setTimeout(() => {
      navigation.reset({
        index: 0,
        routes: [{name: 'Signin'}],
      });
    }, 1500);
  });

  const {
    control,
    handleSubmit,
    formState: {errors},
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

  const onSubmit = async (
    formValues: UpdatePasswordFormValues,
  ): Promise<void> => {
    try {
      if (!email || !token) {
        loggingService.error('Missing required parameters: email or token');
        return;
      }

      // Use the hook-based updatePassword function with all required parameters
      await updatePassword(email, token, formValues.password);
    } catch (error) {
      loggingService.error('Error in onSubmit:', error);
    }
  };

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
                  onPress={handleSubmit(onSubmit)}
                  loading={loading}
                  disabled={loading || !email || !token}
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
