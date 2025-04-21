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
import {useAuth} from '@navigation/index';
import {Icon, AnimatedInput, Button} from '@components/index';
import {useForm} from '@hooks/index';
import {LoginFormValues, validateLoginForm} from '@utils/validation';

export function LoginScreen() {
  const [showPassword, setShowPassword] = useState(false);
  const {login} = useAuth();
  const {height} = useWindowDimensions();
  const navigation = useNavigation<NativeStackNavigationProp<any>>();

  const {
    values: credentials,
    errors,
    isSubmitting,
    handleChange,
    handleSubmit,
    setErrors,
  } = useForm<LoginFormValues>(
    {
      email: '',
      password: '',
    },
    validateLoginForm,
  );

  function togglePasswordVisibility() {
    setShowPassword(!showPassword);
  }

  async function handleLogin() {
    handleSubmit(async values => {
      try {
        const {success, error} = await login(values.email, values.password);

        if (!success && error) {
          setErrors({password: error});
        }
        // If successful, the useAuth hook will update isAuthenticated
        // which will trigger the navigation to switch to MainNavigator
      } catch (error) {
        setErrors({
          password: 'An unexpected error occurred. Please try again.',
        });
      }
    });
  }

  function handleSignUp() {
    // Navigate to sign up screen
  }

  function handleForgotPassword() {
    navigation.navigate('ForgotPassword');
  }

  function handleSocialLogin(provider: 'google' | 'apple' | 'facebook') {
    // Handle social login based on provider type
    console.log(`Social login with ${provider}`);
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled">
          <View style={[styles.content, {minHeight: height * 0.8}]}>
            <View style={styles.logoContainer}>
              <Image
                source={require('@assets/images/motorove_logo_dark.png')}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>

            <Text style={styles.welcomeText}>
              Welcome back! Please login to continue
            </Text>

            <View style={styles.form}>
              <AnimatedInput
                label="Email Address"
                value={credentials.email}
                onChangeText={text => handleChange('email', text)}
                keyboardType="email-address"
                icon={<Icon name="envelope" size={20} />}
                error={errors.email}
                testID="login-email"
              />

              <AnimatedInput
                label="Password"
                value={credentials.password}
                onChangeText={text => handleChange('password', text)}
                secureTextEntry={!showPassword}
                icon={<Icon name="eye-slash" size={20} />}
                error={errors.password}
                onToggleSecureEntry={togglePasswordVisibility}
                showPassword={showPassword}
                testID="login-password"
              />

              <TouchableOpacity
                style={styles.forgotPasswordContainer}
                onPress={handleForgotPassword}>
                <Text style={styles.forgotPasswordText}>Forgot password?</Text>
              </TouchableOpacity>

              <Button
                title="Login"
                onPress={handleLogin}
                loading={isSubmitting}
                disabled={isSubmitting}
                testID="login-button"
              />

              <View style={styles.dividerContainer}>
                <View style={styles.divider} />
                <Text style={styles.dividerText}>OR</Text>
                <View style={styles.divider} />
              </View>

              <View style={styles.socialButtonsContainer}>
                <TouchableOpacity
                  style={styles.socialButton}
                  onPress={() => handleSocialLogin('google')}>
                  <Image
                    source={require('@assets/icons/google.svg')}
                    style={styles.socialIcon}
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.socialButton}
                  onPress={() => handleSocialLogin('apple')}>
                  <Image
                    source={require('@assets/icons/apple.svg')}
                    style={styles.socialIcon}
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.socialButton}
                  onPress={() => handleSocialLogin('facebook')}>
                  <Image
                    source={require('@assets/icons/facebook.svg')}
                    style={styles.socialIcon}
                  />
                </TouchableOpacity>
              </View>

              <View style={styles.signupContainer}>
                <Text style={styles.signupText}>Don't have an account? </Text>
                <TouchableOpacity onPress={handleSignUp}>
                  <Text style={styles.signupLink}>Sign up</Text>
                </TouchableOpacity>
              </View>
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
  logoContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logo: {
    width: 180,
    height: 60,
  },
  welcomeText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  form: {
    width: '100%',
  },
  forgotPasswordContainer: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    color: '#FF3B30',
    fontSize: 14,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#E0E0E0',
  },
  dividerText: {
    color: '#888',
    paddingHorizontal: 16,
    fontSize: 14,
  },
  socialButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginBottom: 24,
  },
  socialButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  socialIcon: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
  },
  signupText: {
    color: '#666',
    fontSize: 14,
  },
  signupLink: {
    color: '#FF3B30',
    fontSize: 14,
    fontWeight: '600',
  },
});
