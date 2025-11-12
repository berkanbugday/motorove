import React, {useState} from 'react';
import {View, StyleSheet, SafeAreaView} from 'react-native';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {useNavigation} from '@react-navigation/native';
import {useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {colors, commonStyles, spacing} from '@theme';
import {Button, TopHeaderBar, AnimatedInput, LoadingIndicator} from '@components';
import {useTranslation} from '@hooks/useTranslation';
import {loggingService} from '@services/logging.service';
import {
  authSchemas,
  ChangePasswordFormValues,
} from '@utils/validation/authValidation';
import {useUpdatePassword} from '@services';

/**
 * Change Password Screen - Allows users to change their password
 */
export const ChangePasswordScreen = () => {
  const navigation = useNavigation();
  const {t} = useTranslation();

  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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

  const {updatePassword, loading} = useUpdatePassword(() =>
    setTimeout(() => {
      navigation.goBack();
    }, 1000),
  );

  const toggleNewPasswordVisibility = () => {
    setShowNewPassword(!showNewPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const onSubmit = async (data: ChangePasswordFormValues) => {
    try {
      await updatePassword(data.newPassword);
    } catch (error) {
      loggingService.error('Error in onSubmit:', error);
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
          title={loading ? t('common.updating') : t('common.save')}
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
