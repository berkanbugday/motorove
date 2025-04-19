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
  Animated,
  TextStyle,
  Alert,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {Icon} from '../../components';
import {useWindowDimensions} from 'react-native';

interface AnimatedInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  icon: React.ReactNode;
  error?: string;
}

function AnimatedInput({
  label,
  value,
  onChangeText,
  keyboardType = 'default',
  icon,
  error,
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
        keyboardType={keyboardType}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        autoCapitalize="none"
      />
      <View style={styles.inputIcon}>{icon}</View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

export function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {height} = useWindowDimensions();
  const navigation = useNavigation<NativeStackNavigationProp<any>>();

  function handleChange(value: string) {
    setEmail(value);
    if (error) setError('');
  }

  async function handleSendResetLink() {
    if (!email) {
      setError('Email is required');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setError('');
    setIsSubmitting(true);

    try {
      // TODO: Implement actual password reset with Supabase
      // Example: const { error } = await supabase.auth.resetPasswordForEmail(email);

      // For demo purposes:
      setTimeout(() => {
        Alert.alert(
          'Reset Link Sent',
          'A password reset link has been sent to your email address.',
          [{text: 'OK', onPress: () => navigation.navigate('Login')}],
        );
        setIsSubmitting(false);
      }, 1500);
    } catch (err) {
      setError('An error occurred. Please try again.');
      setIsSubmitting(false);
    }
  }

  function navigateToLogin() {
    navigation.navigate('Login');
  }

  function navigateToSupport() {
    // Navigate to support or open support URL
    // This would typically open a support page or contact form
    Alert.alert(
      'Support',
      'Contact support functionality will be implemented here.',
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}>
        <ScrollView
          contentContainerStyle={[styles.scrollContent, {minHeight: height}]}
          keyboardShouldPersistTaps="handled">
          <View style={styles.contentContainer}>
            <View style={styles.headerContainer}>
              <Text style={styles.title}>Reset your password</Text>
              <Text style={styles.subtitle}>
                Enter your email address and we'll send you instructions to
                reset your password.
              </Text>
            </View>

            <View style={styles.formContainer}>
              <AnimatedInput
                label="Email Address"
                value={email}
                onChangeText={text => handleChange(text)}
                keyboardType="email-address"
                icon={<Icon name="envelope" size={20} />}
                error={error}
              />

              <TouchableOpacity
                style={[styles.button, isSubmitting && styles.buttonDisabled]}
                onPress={handleSendResetLink}
                disabled={isSubmitting}>
                <Text style={styles.buttonText}>
                  {isSubmitting ? 'Sending...' : 'Send Reset Link'}
                </Text>
              </TouchableOpacity>

              <View style={styles.linksContainer}>
                <TouchableOpacity onPress={navigateToLogin}>
                  <Text style={styles.link}>Remember your password? Login</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={navigateToSupport}>
                  <Text style={styles.link}>Need help? Contact Support</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.footerContainer}>
              <Text style={styles.footerText}>
                For your security, a password reset link will be sent to your
                registered email address. The link will expire in 24 hours.
              </Text>
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
    backgroundColor: '#fff',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  contentContainer: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  headerContainer: {
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#121212',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    lineHeight: 22,
  },
  formContainer: {
    marginBottom: 30,
  },
  formLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    color: '#333',
  },
  inputContainer: {
    marginBottom: 20,
    position: 'relative',
  },
  labelContainer: {
    position: 'absolute',
    zIndex: 10,
    width: '100%',
    height: 50,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingRight: 50,
    fontSize: 16,
    color: '#121212',
    backgroundColor: '#fff',
    zIndex: 2,
  },
  inputError: {
    borderColor: '#FF3B30',
  },
  inputIcon: {
    position: 'absolute',
    right: 15,
    top: 18,
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 14,
    marginTop: 5,
    marginLeft: 5,
  },
  button: {
    backgroundColor: '#FF3B30',
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  linksContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  link: {
    color: '#121212',
    fontSize: 16,
    marginVertical: 10,
  },
  footerContainer: {
    padding: 15,
  },
  footerText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
});
