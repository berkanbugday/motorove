import React from 'react';
import {View, StyleSheet, SafeAreaView} from 'react-native';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {useNavigation} from '@react-navigation/native';
import {useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {colors, commonStyles, spacing} from '@theme';
import {Button, TopHeaderBar, AnimatedInput, BodySmall} from '@components';
import {useTranslation} from '@hooks/useTranslation';
import {loggingService} from '@services/logging.service';
import {
  authSchemas,
  ChangeEmailFormValues,
} from '@utils/validation/authValidation';
import {useUpdateEmail} from '@services';
import {useAuth} from '@contexts/AuthContext';

/**
 * Change Email Screen - Allows users to change their email address
 */
export const ChangeEmailScreen = () => {
  const navigation = useNavigation();
  const {t} = useTranslation();
  const {user, signOut} = useAuth();

  const {changeEmailSchema} = authSchemas(t);

  const {
    control,
    handleSubmit,
    formState: {errors},
  } = useForm<ChangeEmailFormValues>({
    resolver: zodResolver(changeEmailSchema),
    defaultValues: {
      email: user?.email,
      newEmail: '',
      confirmEmail: '',
    },
    mode: 'onChange',
  });

  const {updateEmail, loading} = useUpdateEmail(() =>
    setTimeout(() => {
      signOut();
    }, 3000),
  );

  const onSubmit = async (data: ChangeEmailFormValues) => {
    try {
      await updateEmail(user?.email!, data.newEmail);
    } catch (error) {
      loggingService.error('Error in onSubmit:', error);
    }
  };

  return (
    <View style={styles.container}>
      <TopHeaderBar
        title={t('screens.changeEmail.title')}
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
                  name="email"
                  label={t('screens.changeEmail.email')}
                  keyboardType="email-address"
                  editable={false}
                />
              </View>
              <View style={styles.inputGroup}>
                <AnimatedInput
                  control={control}
                  name="newEmail"
                  label={t('screens.changeEmail.new_email')}
                  keyboardType="email-address"
                  error={errors.newEmail}
                />
              </View>

              <View style={styles.inputGroup}>
                <AnimatedInput
                  control={control}
                  name="confirmEmail"
                  label={t('screens.changeEmail.again_new_email')}
                  keyboardType="email-address"
                  error={errors.confirmEmail}
                />
              </View>
            </View>
            {/* Information Message */}
            <View style={styles.infoContainer}>
              <BodySmall lineHeight={24} align="center">
                {t('screens.changeEmail.info_message')}
              </BodySmall>
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
          loading={loading}
          disabled={loading}
        />
      </View>
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
  infoContainer: {
    backgroundColor: colors.status.info + 15,
    borderRadius: spacing.sm,
    padding: spacing.md,
    marginTop: spacing.xl,
    borderLeftColor: colors.status.info,
    borderLeftWidth: 3,
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
