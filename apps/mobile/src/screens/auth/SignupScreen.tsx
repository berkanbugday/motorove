import React, {useState} from 'react';
import {StyleSheet, View, SafeAreaView, Image} from 'react-native';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';

import {
  Icon,
  AnimatedInput,
  Button,
  Checkbox,
  Title,
  Body,
  BodySmall,
  Subtitle,
  TopHeaderBar,
  Caption,
  useBottomSheet,
  WebViewContent,
} from '@components';
import {useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {authSchemas, SignupFormValues} from '@utils/validation';
import {colors, spacing, fontSizes, radius, commonStyles} from '@theme';
import {useGraphQLErrorHandler} from '@hooks/useGraphQLErrorHandler';
import {GraphQLFormattedError} from 'graphql';
import {useTranslation} from '@hooks/useTranslation';
import authService from '@services/auth.service';
import {useLanguage} from '@contexts/LanguageContext';
import {Language} from '@motorove/shared';

export const SignupScreen = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [signupSuccess, setSignupSuccess] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const {handleGraphQLError} = useGraphQLErrorHandler();
  const {t} = useTranslation();
  const {language} = useLanguage();
  const {signUp, resend} = authService;
  const {openBottomSheet} = useBottomSheet();

  // Create validation schema with translations
  const {signupSchema} = authSchemas(t);

  const {
    control,
    handleSubmit,
    formState: {errors, isSubmitting},
    reset,
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      agreeToTerms: true,
    },
  });

  const handleGoBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('Signin');
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const onSubmit = async (data: SignupFormValues) => {
    try {
      const response = await signUp(
        data.firstName,
        data.lastName,
        data.email,
        data.password,
        language.toUpperCase() as Language,
        data.agreeToTerms,
      );

      if (response) {
        setUserEmail(data.email);
        setSignupSuccess(true);
        reset();
      }
    } catch (error) {
      await handleGraphQLError(error as GraphQLFormattedError);
    }
  };

  const handleSignin = () => {
    // Navigate to signin screen
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('Signin');
    }
  };

  const handleResendVerificationEmail = async () => {
    try {
      await resend(userEmail);
    } catch (error) {
      await handleGraphQLError(error as GraphQLFormattedError);
    }
  };

  const handleTermsPress = () => {
    openBottomSheet({
      content: (
        <WebViewContent url={`https://motorove.app/${language}/terms-mobile`} />
      ),
      snapPoint: 'full',
      title: t('screens.signUp.terms_of_service'),
      showCloseButton: true,
      closeButtonPosition: 'top-right',
    });
  };

  const handlePrivacyPress = () => {
    openBottomSheet({
      content: (
        <WebViewContent
          url={`https://motorove.app/${language}/privacy-mobile`}
        />
      ),
      snapPoint: 'full',
      title: t('screens.signUp.privacy_policy'),
      showCloseButton: true,
      closeButtonPosition: 'top-right',
    });
  };

  // View when signup is successful
  if (signupSuccess) {
    return (
      <View style={[styles.content, {justifyContent: 'center'}]}>
        <Title align="center" style={styles.successTitle}>
          {t('screens.signUp.verify_email')}
        </Title>
        <View style={styles.successContainer}>
          <Icon name="paper-plane" size={40} />
          <Body style={{marginTop: spacing.md}}>
            {t('screens.signUp.verification_email_sent')}
          </Body>
          <Body weight="semiBold">{userEmail}</Body>
          <BodySmall align="center" style={styles.successText}>
            {t('screens.signUp.check_spam_folder')}
          </BodySmall>
        </View>
        <Button
          title={t('screens.signUp.sign_in')}
          variant="primary"
          shape="round"
          onPress={handleSignin}
          style={{marginVertical: spacing.sm}}
          testID="back-to-signin-button"
        />
        <Button
          title={t('screens.signUp.resend_verification_email')}
          variant="outline"
          shape="round"
          onPress={handleResendVerificationEmail}
          style={{marginVertical: spacing.sm}}
          testID="resend-verification-email-button"
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TopHeaderBar
        showBackButton
        showShadow={false}
        onBackPress={handleGoBack}
      />
      <SafeAreaView style={styles.container}>
        <KeyboardAwareScrollView
          showsVerticalScrollIndicator={false}
          enableOnAndroid={true}
          enableAutomaticScroll={true}
          enableResetScrollToCoords={false}
          keyboardShouldPersistTaps="handled">
          <View style={styles.content}>
            <View style={styles.logoContainer}>
              <Image
                source={require('@assets/images/motorove_logo_dark.png')}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>

            <Subtitle
              align="center"
              weight="medium"
              color={colors.neutral.grey}
              style={styles.welcomeText}>
              {t('screens.signUp.create_account_intro')}
            </Subtitle>

            <View style={styles.form}>
              <AnimatedInput
                control={control}
                name="firstName"
                label={t('screens.signUp.first_name')}
                icon={<Icon name="user-filled" size={20} />}
                error={errors.firstName}
                testID="signup-firstname"
              />

              <AnimatedInput
                control={control}
                name="lastName"
                label={t('screens.signUp.last_name')}
                icon={<Icon name="user-filled" size={20} />}
                error={errors.lastName}
                testID="signup-lastname"
              />

              <AnimatedInput
                control={control}
                name="email"
                label={t('screens.signUp.email_address')}
                keyboardType="email-address"
                icon={<Icon name="envelope-filled" size={20} />}
                error={errors.email}
                testID="signup-email"
              />

              <AnimatedInput
                control={control}
                name="password"
                label={t('screens.signUp.password')}
                secureTextEntry={!showPassword}
                error={errors.password}
                onToggleSecureEntry={togglePasswordVisibility}
                showPassword={showPassword}
                testID="signup-password"
                showClearButton={false}
              />

              <Checkbox
                control={control}
                name="agreeToTerms"
                error={errors.agreeToTerms}
                testID="terms-checkbox"
                variant="outline"
                size="medium"
                label={
                  <View style={styles.termsTextContainer}>
                    <Caption color={colors.neutral.grey}>
                      {t('screens.signUp.i_agree_to')}
                    </Caption>
                    <Button
                      title={t('screens.signUp.terms_of_service')}
                      variant="text"
                      onPress={handleTermsPress}
                      textStyle={styles.termsLink}
                    />
                    <Caption color={colors.neutral.grey}>
                      {t('common.and')}
                    </Caption>
                    <Button
                      title={t('screens.signUp.privacy_policy')}
                      variant="text"
                      onPress={handlePrivacyPress}
                      textStyle={styles.termsLink}
                    />
                  </View>
                }
              />
            </View>
            <Button
              title={t('screens.signUp.sign_up')}
              shape="round"
              onPress={handleSubmit(onSubmit)}
              loading={isSubmitting}
              disabled={isSubmitting}
              style={styles.signupButton}
              testID="signup-button"
            />
          </View>
        </KeyboardAwareScrollView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...commonStyles.container,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.md,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  logo: {
    width: 100,
    height: 100,
  },
  welcomeText: {
    marginBottom: spacing.xl,
  },
  form: {
    width: '100%',
    gap: spacing.lg,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: colors.neutral.veryLightGrey,
  },
  dividerText: {
    paddingHorizontal: spacing.md,
  },
  socialButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
  },
  socialButton: {
    width: 50,
    height: 50,
    borderRadius: radius.round,
    borderWidth: 1,
    borderColor: colors.neutral.veryLightGrey,
    justifyContent: 'center',
    alignItems: 'center',
  },
  signinContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signinLink: {
    color: colors.neutral.black,
    marginLeft: -20,
    textDecorationLine: 'underline',
  },
  termsTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: spacing.xs,
  },
  termsLink: {
    fontSize: fontSizes.sm,
    textDecorationLine: 'underline',
    marginLeft: -20,
    marginRight: -20,
  },
  successTitle: {
    marginBottom: spacing.md,
  },
  successContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  successText: {
    marginBottom: spacing.md,
  },
  signupButton: {
    marginTop: spacing.md,
  },
});
