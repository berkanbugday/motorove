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
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export const ForgotPasswordScreen: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isEmailSent, setIsEmailSent] = useState(false);

  const handleResetPassword = () => {
    // Implement password reset logic here
    console.log('Reset password pressed');
    setIsEmailSent(true);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}>
        <View style={styles.content}>
          {/* Header Area */}
          <View style={styles.headerContainer}>
            <TouchableOpacity style={styles.backButton}>
              <Icon name="arrow-left" size={24} color="#1a1a1a" />
            </TouchableOpacity>
            <Text style={styles.title}>Reset Password</Text>
            <Text style={styles.subtitle}>
              Enter your email address to receive password reset instructions
            </Text>
          </View>

          {/* Form Area */}
          <View style={styles.formContainer}>
            {!isEmailSent ? (
              <>
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

                <TouchableOpacity
                  style={styles.resetButton}
                  onPress={handleResetPassword}>
                  <Text style={styles.resetButtonText}>Send Reset Link</Text>
                </TouchableOpacity>
              </>
            ) : (
              <View style={styles.successContainer}>
                <View style={styles.iconCircle}>
                  <Icon name="email-check" size={40} color="#007AFF" />
                </View>
                <Text style={styles.successTitle}>Check Your Email</Text>
                <Text style={styles.successText}>
                  We have sent password recovery instructions to your email
                </Text>
                <TouchableOpacity style={styles.resendButton}>
                  <Text style={styles.resendButtonText}>
                    Didn't receive the email? Resend
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Back to Login */}
          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Remember your password? </Text>
            <TouchableOpacity>
              <Text style={styles.loginLink}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
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
  content: {
    flex: 1,
    padding: 24,
  },
  headerContainer: {
    marginTop: 20,
    marginBottom: 32,
  },
  backButton: {
    marginBottom: 16,
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
    lineHeight: 22,
  },
  formContainer: {
    width: '100%',
    flex: 1,
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
  resetButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  resetButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  successContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E8F1FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  successText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  resendButton: {
    paddingVertical: 8,
  },
  resendButtonText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '500',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 24,
  },
  loginText: {
    color: '#666',
  },
  loginLink: {
    color: '#007AFF',
    fontWeight: '600',
  },
});

export default ForgotPasswordScreen;
