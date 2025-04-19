import React, {useState, useRef} from 'react';
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
  Image,
  Animated,
  TextStyle,
} from 'react-native';
import {useWindowDimensions} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useAuth} from '../../navigation';
import {Icon} from '../../components';

interface LoginCredentials {
  email: string;
  password: string;
}

interface AnimatedInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  icon: React.ReactNode;
  error?: string;
  onToggleSecureEntry?: () => void;
  showPassword?: boolean;
}

function AnimatedInput({
  label,
  value,
  onChangeText,
  secureTextEntry = false,
  keyboardType = 'default',
  icon,
  error,
  onToggleSecureEntry,
  showPassword,
}: AnimatedInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const animatedIsFocused = useRef(new Animated.Value(value ? 1 : 0)).current;
  const inputRef = useRef<TextInput>(null);

  React.useEffect(() => {
    Animated.timing(animatedIsFocused, {
      toValue: isFocused || value ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [animatedIsFocused, isFocused, value]);

  const labelStyle: Animated.AnimatedProps<TextStyle> = {
    position: 'absolute',
    left: 15,
    top: animatedIsFocused.interpolate({
      inputRange: [0, 1],
      outputRange: [15, -10],
    }),
    fontSize: animatedIsFocused.interpolate({
      inputRange: [0, 1],
      outputRange: [16, 12],
    }),
    color: animatedIsFocused.interpolate({
      inputRange: [0, 1],
      outputRange: ['#888', '#121212'],
    }),
    backgroundColor: '#fff',
    paddingHorizontal: 5,
    zIndex: 5,
  };

  const handleLabelPress = () => {
    inputRef.current?.focus();
  };

  return (
    <View style={styles.inputContainer}>
      <TouchableOpacity
        activeOpacity={1}
        onPress={handleLabelPress}
        style={styles.labelContainer}>
        <Animated.Text style={labelStyle}>{label}</Animated.Text>
      </TouchableOpacity>
      <TextInput
        ref={inputRef}
        style={[styles.input, error && styles.inputError]}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        autoCapitalize="none"
      />
      <View style={styles.inputIcon}>
        {onToggleSecureEntry ? (
          <TouchableOpacity onPress={onToggleSecureEntry}>
            <Icon name={showPassword ? 'eye' : 'eye-slash'} size={20} />
          </TouchableOpacity>
        ) : (
          icon
        )}
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
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
  const navigation = useNavigation<NativeStackNavigationProp<any>>();

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
                source={require('../../assets/images/motorove_logo_dark.png')}
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
              />

              <AnimatedInput
                label="Password"
                value={credentials.password}
                onChangeText={text => handleChange('password', text)}
                secureTextEntry={!showPassword}
                icon={
                  <Icon name={showPassword ? 'eye' : 'eye-slash'} size={24} />
                }
                error={errors.password}
                onToggleSecureEntry={togglePasswordVisibility}
                showPassword={showPassword}
              />

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
                  {isSubmitting ? 'Logging In...' : 'Login'}
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
                  <Icon name="google" size={24} color="#121212" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.socialButton}
                  onPress={() => handleSocialLogin('apple')}>
                  <Icon name="apple" size={24} color="#121212" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.socialButton}
                  onPress={() => handleSocialLogin('facebook')}>
                  <Icon name="facebook" size={24} color="#121212" />
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
  logo: {
    width: 100,
    height: 100,
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
  inputError: {
    borderColor: '#FF3B30',
  },
  inputIcon: {
    position: 'absolute',
    right: 15,
    top: 16,
  },
  iconText: {
    fontSize: 20,
    color: '#888',
  },
  errorText: {
    color: '#FF3B30',
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
  labelContainer: {
    position: 'absolute',
    zIndex: 10,
    width: '100%',
    height: 50,
  },
});
