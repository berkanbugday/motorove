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
} from '@components';
import {ResetPasswordFormValues, createAuthSchemas} from '@utils/validation';
import {useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {colors} from '@theme/colors';
import {spacing} from '@theme/spacing';
import {useResetPassword} from '@services/auth.service';
import {loggingService} from '@services/logging.service';
import {useTranslation} from '@hooks/useTranslation';

export const ResetPasswordScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const {height} = useWindowDimensions();
  const {t} = useTranslation();
  const {resetPassword, loading} = useResetPassword(() => {
    // Reset form after successful submission
    reset();
    // Navigate to signin screen
    setTimeout(() => {
      navigation.navigate('Signin');
    }, 1500);
  });

  // Create validation schema with translations
  const {resetPasswordSchema} = createAuthSchemas(t);

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
                {t('screens.resetPassword.resetPassword')}
              </Title>
              <Body
                align="center"
                color={colors.neutral.grey}
                style={styles.subtitle}>
                {t('screens.resetPassword.resetPasswordInstructions')}
              </Body>

              <View style={styles.form}>
                <AnimatedInput
                  control={control}
                  name="email"
                  label={t('screens.resetPassword.emailAddress')}
                  keyboardType="email-address"
                  icon={<Icon name="envelope-filled" size={20} />}
                  error={errors.email}
                  testID="reset-password-email"
                />

                <Button
                  title={t('screens.resetPassword.resetPassword')}
                  shape="round"
                  onPress={handleSubmit(onSubmit)}
                  loading={loading}
                  disabled={loading}
                  style={styles.resetButton}
                  testID="send-reset-button"
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
