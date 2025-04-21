import React, {useState} from 'react';
import {
  StyleSheet,
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  SafeAreaView,
  Image,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {Icon, AnimatedInput, Button} from '@components/index';
import {useForm} from '@hooks/index';
import {
  ForgotPasswordFormValues,
  validateForgotPasswordForm,
} from '@utils/validation';

export function ForgotPasswordScreen() {
  const [emailSent, setEmailSent] = useState(false);
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const {height} = useWindowDimensions();

  const {values, errors, isSubmitting, handleChange, handleSubmit, setErrors} =
    useForm<ForgotPasswordFormValues>(
      {
        email: '',
      },
      validateForgotPasswordForm,
    );

  function handleGoBack() {
    navigation.goBack();
  }

  async function handleResetPassword() {
    handleSubmit(async _formValues => {
      try {
        // TODO: Implement actual password reset with Supabase
        // Example: const { error } = await supabase.auth.resetPasswordForEmail(_formValues.email);

        // For demo purposes, simulate success after a delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Set email sent flag to show confirmation view
        setEmailSent(true);
      } catch (error) {
        setErrors({
          email: 'Failed to send reset email. Please try again.',
        });
      }
    });
  }

  // View when email has been sent
  if (emailSent) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <View style={styles.logoContainer}>
            <Image
              source={require('@assets/images/motorove_logo_dark.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>

          <View style={styles.successContainer}>
            <Icon name="envelope" size={60} color="#4CAF50" />
            <Text style={styles.successTitle}>Email Sent!</Text>
            <Text style={styles.successText}>
              We've sent password reset instructions to your email address.
              Please check your inbox.
            </Text>
            <Button
              title="Back to Login"
              onPress={handleGoBack}
              variant="primary"
              style={styles.backButton}
              testID="back-to-login-button"
            />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // Reset password form view
  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled">
          <View style={[styles.content, {minHeight: height * 0.8}]}>
            <TouchableOpacity
              style={styles.backButtonContainer}
              onPress={handleGoBack}>
              <Icon name="eye" size={20} />{' '}
              {/* Using eye icon as a placeholder since we don't have a back arrow icon */}
              <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>

            <View style={styles.logoContainer}>
              <Image
                source={require('@assets/images/motorove_logo_dark.png')}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>

            <Text style={styles.title}>Forgot Password</Text>
            <Text style={styles.subtitle}>
              Enter your email address and we'll send you instructions to reset
              your password.
            </Text>

            <View style={styles.form}>
              <AnimatedInput
                label="Email Address"
                value={values.email}
                onChangeText={text => handleChange('email', text)}
                keyboardType="email-address"
                icon={<Icon name="envelope" size={20} />}
                error={errors.email}
                testID="forgot-password-email"
              />

              <Button
                title="Send Reset Link"
                onPress={handleResetPassword}
                loading={isSubmitting}
                disabled={isSubmitting}
                style={styles.resetButton}
                testID="send-reset-button"
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  backButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
  },
  backButtonText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#333',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logo: {
    width: 180,
    height: 60,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  form: {
    width: '100%',
  },
  resetButton: {
    marginTop: 16,
  },
  successContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
    marginBottom: 16,
  },
  successText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  backButton: {
    marginTop: 20,
  },
});
