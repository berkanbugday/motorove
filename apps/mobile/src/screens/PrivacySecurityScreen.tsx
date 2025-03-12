import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export function PrivacySecurityScreen() {
  const [settings, setSettings] = useState({
    twoFactorAuth: true,
    biometricLogin: true,
    locationTracking: true,
    dataSharing: false,
    showProfilePhoto: true,
  });

  const toggleSetting = (key: keyof typeof settings) => {
    setSettings(prev => ({...prev, [key]: !prev[key]}));
    // TODO: Implement actual settings update
  };

  const handleChangePassword = () => {
    // TODO: Implement change password functionality
    Alert.alert('Change Password', 'This feature will be available soon!');
  };

  const handlePrivacyPolicy = () => {
    // TODO: Implement privacy policy view
    Alert.alert('Privacy Policy', 'This feature will be available soon!');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Security</Text>
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Icon name="two-factor-authentication" size={24} color="#333" />
              <View>
                <Text style={styles.settingText}>
                  Two-Factor Authentication
                </Text>
                <Text style={styles.settingDescription}>
                  Add an extra layer of security to your account
                </Text>
              </View>
            </View>
            <Switch
              value={settings.twoFactorAuth}
              onValueChange={() => toggleSetting('twoFactorAuth')}
              trackColor={{false: '#D1D1D6', true: '#007AFF'}}
            />
          </View>
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Icon name="fingerprint" size={24} color="#333" />
              <View>
                <Text style={styles.settingText}>Biometric Login</Text>
                <Text style={styles.settingDescription}>
                  Use Face ID or Touch ID to log in
                </Text>
              </View>
            </View>
            <Switch
              value={settings.biometricLogin}
              onValueChange={() => toggleSetting('biometricLogin')}
              trackColor={{false: '#D1D1D6', true: '#007AFF'}}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Privacy</Text>
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Icon name="map-marker" size={24} color="#333" />
              <View>
                <Text style={styles.settingText}>Location Tracking</Text>
                <Text style={styles.settingDescription}>
                  Allow app to track your location
                </Text>
              </View>
            </View>
            <Switch
              value={settings.locationTracking}
              onValueChange={() => toggleSetting('locationTracking')}
              trackColor={{false: '#D1D1D6', true: '#007AFF'}}
            />
          </View>
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Icon name="account-circle" size={24} color="#333" />
              <View>
                <Text style={styles.settingText}>Profile Photo Visibility</Text>
                <Text style={styles.settingDescription}>
                  Show your profile photo to other users
                </Text>
              </View>
            </View>
            <Switch
              value={settings.showProfilePhoto}
              onValueChange={() => toggleSetting('showProfilePhoto')}
              trackColor={{false: '#D1D1D6', true: '#007AFF'}}
            />
          </View>
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Icon name="database" size={24} color="#333" />
              <View>
                <Text style={styles.settingText}>Data Sharing</Text>
                <Text style={styles.settingDescription}>
                  Share usage data to improve our service
                </Text>
              </View>
            </View>
            <Switch
              value={settings.dataSharing}
              onValueChange={() => toggleSetting('dataSharing')}
              trackColor={{false: '#D1D1D6', true: '#007AFF'}}
            />
          </View>
        </View>

        <TouchableOpacity style={styles.button} onPress={handleChangePassword}>
          <Text style={styles.buttonText}>Change Password</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={handlePrivacyPolicy}>
          <Text style={styles.buttonText}>Privacy Policy</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  container: {
    flex: 1,
  },
  section: {
    backgroundColor: '#FFFFFF',
    marginTop: 20,
    marginHorizontal: 20,
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  settingText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 15,
  },
  settingDescription: {
    fontSize: 14,
    color: '#666',
    marginLeft: 15,
  },
  button: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginTop: 15,
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  buttonText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '500',
  },
});
