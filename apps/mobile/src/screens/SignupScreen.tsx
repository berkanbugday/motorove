import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export const SignupScreen: React.FC = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);

  const handleSignup = () => {
    // Implement signup logic here
    console.log('Signup pressed');
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            {/* Header Area */}
            <View style={styles.headerContainer}>
              <Text style={styles.title}>Create Account</Text>
              <Text style={styles.subtitle}>Sign up to get started</Text>
            </View>

            {/* Form Area */}
            <View style={styles.formContainer}>
              <View style={styles.inputContainer}>
                <Icon
                  name="account-outline"
                  size={24}
                  color="#666"
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Full Name"
                  value={fullName}
                  onChangeText={setFullName}
                  autoCapitalize="words"
                />
              </View>

              <View style={styles.inputContainer}>
                <Icon
                  name="email-outline"
                  size={24}
                  color="#666"
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Email"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              <View style={styles.inputContainer}>
                <Icon
                  name="lock-outline"
                  size={24}
                  color="#666"
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />
                <Pressable
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeIcon}>
                  <Icon
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={24}
                    color="#666"
                  />
                </Pressable>
              </View>

              <View style={styles.inputContainer}>
                <Icon
                  name="lock-outline"
                  size={24}
                  color="#666"
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                />
                <Pressable
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={styles.eyeIcon}>
                  <Icon
                    name={
                      showConfirmPassword ? 'eye-off-outline' : 'eye-outline'
                    }
                    size={24}
                    color="#666"
                  />
                </Pressable>
              </View>

              {/* Terms and Conditions */}
              <Pressable
                style={styles.termsContainer}
                onPress={() => setAcceptTerms(!acceptTerms)}>
                <Icon
                  name={
                    acceptTerms ? 'checkbox-marked' : 'checkbox-blank-outline'
                  }
                  size={24}
                  color="#007AFF"
                />
                <Text style={styles.termsText}>
                  I accept the{' '}
                  <Text style={styles.termsLink}>Terms and Conditions</Text>
                </Text>
              </Pressable>

              {/* Signup Button */}
              <TouchableOpacity
                style={styles.signupButton}
                onPress={handleSignup}>
                <Text style={styles.signupButtonText}>Create Account</Text>
              </TouchableOpacity>

              {/* Social Signup */}
              <View style={styles.socialContainer}>
                <Text style={styles.orText}>Or sign up with</Text>
                <View style={styles.socialButtons}>
                  <TouchableOpacity style={styles.socialButton}>
                    <Icon name="google" size={24} color="#DB4437" />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.socialButton}>
                    <Icon name="apple" size={24} color="#000" />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.socialButton}>
                    <Icon name="facebook" size={24} color="#4267B2" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Login Link */}
              <View style={styles.loginContainer}>
                <Text style={styles.loginText}>Already have an account? </Text>
                <TouchableOpacity>
                  <Text style={styles.loginLink}>Sign In</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  headerContainer: {
    marginBottom: 32,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  formContainer: {
    width: '100%',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    marginBottom: 16,
    paddingHorizontal: 16,
    height: 56,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1a1a1a',
  },
  eyeIcon: {
    padding: 4,
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  termsText: {
    marginLeft: 8,
    color: '#666',
    flex: 1,
  },
  termsLink: {
    color: '#007AFF',
    fontWeight: '500',
  },
  signupButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  signupButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  socialContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  orText: {
    color: '#666',
    marginBottom: 16,
  },
  socialButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
  },
  socialButton: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginText: {
    color: '#666',
  },
  loginLink: {
    color: '#007AFF',
    fontWeight: '600',
  },
});

export default SignupScreen;
