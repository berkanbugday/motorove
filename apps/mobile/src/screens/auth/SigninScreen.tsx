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
import {Icon, AnimatedInput, Button, Body, TopHeaderBar} from '@components';
import {useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {createAuthSchemas, SigninFormValues} from '@utils/validation';
import {colors, spacing, radius, commonStyles} from '@theme';
import {useAuth} from '@contexts';
import {useGraphQLErrorHandler} from '@hooks/useGraphQLErrorHandler';
import {useTranslation} from '@hooks/useTranslation';
import {GraphQLFormattedError} from 'graphql';

export const SigninScreen = () => {
  const [showPassword, setShowPassword] = useState(false);
  const {signIn} = useAuth();
  const {height} = useWindowDimensions();
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const {handleGraphQLError} = useGraphQLErrorHandler();
  const {t} = useTranslation();

  const {signinSchema} = createAuthSchemas(t);

  const {
    control,
    handleSubmit,
    formState: {errors, isSubmitting},
  } = useForm<SigninFormValues>({
    resolver: zodResolver(signinSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const onSubmit = async (data: SigninFormValues) => {
    try {
      await signIn(data.email.trim(), data.password.trim());
    } catch (error) {
      await handleGraphQLError(error as GraphQLFormattedError);
    }
  };

  const handleSignUp = () => {
    navigation.navigate('Signup');
  };

  const handleForgotPassword = () => {
    navigation.navigate('ResetPassword');
  };

  return (
    <View style={styles.container}>
      <TopHeaderBar showShadow={false} />
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.container}>
          <ScrollView keyboardShouldPersistTaps="handled">
            <View style={[styles.content, {minHeight: height * 0.8}]}>
              <View style={styles.logoContainer}>
                <Image
                  source={require('@assets/images/motorove_logo_dark.png')}
                  style={styles.logo}
                  resizeMode="contain"
                />
              </View>

              <Body style={styles.welcomeText}>
                {t('screens.signIn.welcome_back')}
              </Body>

              <View style={styles.form}>
                <AnimatedInput
                  control={control}
                  name="email"
                  label={t('screens.signIn.email_address')}
                  keyboardType="email-address"
                  icon={<Icon name="envelope-filled" size={20} />}
                  error={errors.email}
                  testID="signin-email"
                />

                <AnimatedInput
                  control={control}
                  name="password"
                  label={t('screens.signIn.password')}
                  secureTextEntry={!showPassword}
                  error={errors.password}
                  onToggleSecureEntry={togglePasswordVisibility}
                  showPassword={showPassword}
                  testID="signin-password"
                  showClearButton={false}
                />

                <Button
                  title={t('screens.signIn.forgot_password')}
                  variant="text"
                  size="small"
                  onPress={handleForgotPassword}
                  style={styles.forgotPasswordContainer}
                  testID="forgot-password-button"
                />

                <Button
                  title={t('screens.signIn.sign_in')}
                  shape="round"
                  onPress={handleSubmit(onSubmit)}
                  loading={isSubmitting}
                  disabled={isSubmitting}
                  testID="signin-button"
                />
                <View style={styles.signupContainer}>
                  <Body color={colors.neutral.grey}>
                    {t('screens.signIn.no_account')}
                  </Body>
                  <Button
                    title={t('screens.signIn.sign_up')}
                    variant="text"
                    onPress={handleSignUp}
                    textStyle={styles.signupLink}
                    testID="signup-button"
                  />
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
    color: colors.neutral.grey,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  form: {
    width: '100%',
    gap: spacing.lg,
  },
  forgotPasswordContainer: {
    alignSelf: 'flex-end',
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
    color: colors.neutral.grey,
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
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signupLink: {
    color: colors.neutral.black,
    marginLeft: -20,
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
});
