import React, {useState} from 'react';
import {
  StyleSheet,
  View,
  TextInput,
  TouchableOpacity,
  Text,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import {useWindowDimensions} from 'react-native';
import {useAuth} from '../../navigation';
import {Icon} from '../../components';

interface LoginCredentials {
  email: string;
  password: string;
}

export function LoginScreen() {
  const [credentials, setCredentials] = useState<LoginCredentials>({
    email: '',
    password: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Partial<LoginCredentials>>({});

  const {login} = useAuth();
  const {height} = useWindowDimensions();

  function handleChange(key: keyof LoginCredentials, value: string) {
    setCredentials(prev => ({...prev, [key]: value}));
    if (errors[key]) {
      setErrors(prev => ({...prev, [key]: undefined}));
    }
  }

  async function handleLogin() {
    const newErrors: Partial<LoginCredentials> = {};

    if (!credentials.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(credentials.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!credentials.password) {
      newErrors.password = 'Password is required';
    } else if (credentials.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      const {success, error} = await login(
        credentials.email,
        credentials.password,
      );

      if (!success && error) {
        setErrors({password: error});
      }
      // If successful, the useAuth hook will update isAuthenticated
      // which will trigger the navigation to switch to MainNavigator
    } catch (error) {
      setErrors({
        password: 'An unexpected error occurred. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  function togglePasswordVisibility() {
    setShowPassword(!showPassword);
  }

  function handleSignUp() {
    // Navigate to sign up screen
  }

  function handleForgotPassword() {
    // Navigate to forgot password screen
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
              <Text style={styles.logoText}>logo</Text>
            </View>

            <Text style={styles.welcomeText}>
              Welcome back! Please sign in to continue
            </Text>

            <View style={styles.form}>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Email address"
                  placeholderTextColor="#888"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={credentials.email}
                  onChangeText={text => handleChange('email', text)}
                />
                <View style={styles.inputIcon}>
                  <Icon name="envelope" size={24} />
                </View>
                {errors.email ? (
                  <Text style={styles.errorText}>{errors.email}</Text>
                ) : null}
              </View>

              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Password"
                  placeholderTextColor="#888"
                  secureTextEntry={!showPassword}
                  value={credentials.password}
                  onChangeText={text => handleChange('password', text)}
                />
                <TouchableOpacity
                  style={styles.inputIcon}
                  onPress={togglePasswordVisibility}>
                  <Icon name={showPassword ? 'eye' : 'eye-slash'} size={24} />
                </TouchableOpacity>
                {errors.password ? (
                  <Text style={styles.errorText}>{errors.password}</Text>
                ) : null}
              </View>

              <TouchableOpacity
                style={styles.forgotPasswordContainer}
                onPress={handleForgotPassword}>
                <Text style={styles.forgotPasswordText}>Forgot password?</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, isSubmitting && styles.buttonDisabled]}
                onPress={handleLogin}
                disabled={isSubmitting}>
                <Text style={styles.buttonText}>
                  {isSubmitting ? 'Signing In...' : 'Sign In'}
                </Text>
              </TouchableOpacity>

              <View style={styles.dividerContainer}>
                <View style={styles.divider} />
                <Text style={styles.dividerText}>or continue with</Text>
                <View style={styles.divider} />
              </View>

              <View style={styles.socialContainer}>
                <TouchableOpacity
                  style={styles.socialButton}
                  onPress={() => handleSocialLogin('google')}>
                  <Text style={styles.socialButtonText}>G</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.socialButton}
                  onPress={() => handleSocialLogin('apple')}>
                  <Text style={styles.socialButtonText}>🍎</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.socialButton}
                  onPress={() => handleSocialLogin('facebook')}>
                  <Text style={styles.socialButtonText}>f</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.signupContainer}>
                <Text style={styles.signupText}>Don't have an account?</Text>
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
    backgroundColor: '#ffffff',
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 10,
  },
  logoText: {
    fontSize: 32,
    fontFamily: 'cursive',
    fontWeight: 'bold',
  },
  welcomeText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
    textAlign: 'center',
  },
  form: {
    width: '100%',
    maxWidth: 400,
  },
  inputContainer: {
    marginBottom: 20,
    position: 'relative',
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingRight: 50,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  inputIcon: {
    position: 'absolute',
    right: 15,
    top: 12,
  },
  iconText: {
    fontSize: 20,
    color: '#888',
  },
  errorText: {
    color: 'red',
    fontSize: 14,
    marginTop: 5,
    marginLeft: 5,
  },
  forgotPasswordContainer: {
    alignItems: 'flex-end',
    marginBottom: 20,
  },
  forgotPasswordText: {
    color: '#333',
    fontSize: 14,
  },
  button: {
    backgroundColor: '#ff3131',
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonDisabled: {
    backgroundColor: '#ff9999',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#ddd',
  },
  dividerText: {
    marginHorizontal: 10,
    color: '#666',
    fontSize: 14,
  },
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  socialButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 10,
  },
  socialButtonText: {
    fontSize: 20,
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
  },
  signupText: {
    color: '#666',
    fontSize: 14,
  },
  signupLink: {
    color: '#333',
    fontWeight: 'bold',
    marginLeft: 5,
    fontSize: 14,
  },
});
