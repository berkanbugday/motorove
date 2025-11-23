import React, {useState} from 'react';
import {View, StyleSheet, SafeAreaView} from 'react-native';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {useNavigation} from '@react-navigation/native';
import {useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {colors, commonStyles, spacing} from '@theme';
import {
  Button,
  TopHeaderBar,
  AnimatedInput,
  LoadingIndicator,
} from '@components';
import {useTranslation} from '@hooks/useTranslation';
import {loggingService} from '@services/logging.service';
import {
  authSchemas,
  ChangePasswordFormValues,
} from '@utils/validation/authValidation';
import authService from '@services/auth.service';
import {showToast} from '@components';

/**
 * Change Password Screen - Allows users to change their password
 */
export const ChangePasswordScreen = () => {
  const navigation = useNavigation();
  const {t} = useTranslation();

  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const {changePasswordSchema} = authSchemas(t);

  const {
    control,
    handleSubmit,
    formState: {errors},
  } = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      newPassword: '',
      confirmPassword: '',
    },
    mode: 'onChange',
  });

  const toggleNewPasswordVisibility = () => {
    setShowNewPassword(!showNewPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const onSubmit = async (data: ChangePasswordFormValues) => {
    try {
      setLoading(true);
      await authService.updatePassword(data.newPassword);

      showToast({
        type: 'success',
        text1: t('common.success'),
        text2: t('screens.changePassword.success_updated'),
      });

      // Navigate back after 1 second
      setTimeout(() => {
        navigation.goBack();
      }, 1000);
    } catch (error) {
      loggingService.error('Error in onSubmit:', error);
      showToast({
        type: 'error',
        text1: t('common.error'),
        text2: t('screens.changePassword.update_failed'),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <TopHeaderBar
        title={t('screens.changePassword.title')}
        showBackButton
        showShadow={false}
        containerStyle={styles.topHeaderBar}
        onBackPress={() => navigation.goBack()}
      />
      <SafeAreaView style={styles.container}>
        <KeyboardAwareScrollView
          showsVerticalScrollIndicator={false}
          enableOnAndroid={true}
          enableAutomaticScroll={true}
          enableResetScrollToCoords={false}
          keyboardShouldPersistTaps="handled">
          <View style={styles.content}>
            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <AnimatedInput
                  control={control}
                  name="newPassword"
                  label={t('screens.changePassword.new_password')}
                  secureTextEntry={!showNewPassword}
                  error={errors.newPassword}
                  onToggleSecureEntry={toggleNewPasswordVisibility}
                  showPassword={showNewPassword}
                />
              </View>

              <View style={styles.inputGroup}>
                <AnimatedInput
                  control={control}
                  name="confirmPassword"
                  label={t('screens.changePassword.again_new_password')}
                  secureTextEntry={!showConfirmPassword}
                  error={errors.confirmPassword}
                  onToggleSecureEntry={toggleConfirmPasswordVisibility}
                  showPassword={showConfirmPassword}
                />
              </View>
            </View>
          </View>
        </KeyboardAwareScrollView>
      </SafeAreaView>

      {/* Save Button - Fixed at bottom */}
      <View style={styles.buttonContainer}>
        <Button
          variant="dark"
          shape="round"
          title={t('common.update')}
          onPress={handleSubmit(onSubmit)}
          disabled={loading}
        />
      </View>
      <LoadingIndicator visible={loading} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...commonStyles.container,
  },
  topHeaderBar: {
    borderBottomWidth: 1,
    borderBottomColor: colors.secondary.main,
  },
  content: {
    backgroundColor: colors.neutral.white,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
  },
  form: {
    gap: spacing.md,
  },
  inputGroup: {
    marginBottom: spacing.md,
  },
  buttonContainer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    marginVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.secondary.main,
  },
});
