import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export function NotificationsScreen() {
  const [notifications, setNotifications] = useState({
    pushEnabled: true,
    emailEnabled: true,
    rideUpdates: true,
    promotions: false,
    newsAndTips: true,
    soundEnabled: true,
  });

  const toggleSwitch = (key: keyof typeof notifications) => {
    setNotifications(prev => ({...prev, [key]: !prev[key]}));
    // TODO: Implement actual notification settings update
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>General</Text>
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Icon name="bell-ring" size={24} color="#333" />
              <Text style={styles.settingText}>Push Notifications</Text>
            </View>
            <Switch
              value={notifications.pushEnabled}
              onValueChange={() => toggleSwitch('pushEnabled')}
              trackColor={{false: '#D1D1D6', true: '#007AFF'}}
            />
          </View>
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Icon name="email" size={24} color="#333" />
              <Text style={styles.settingText}>Email Notifications</Text>
            </View>
            <Switch
              value={notifications.emailEnabled}
              onValueChange={() => toggleSwitch('emailEnabled')}
              trackColor={{false: '#D1D1D6', true: '#007AFF'}}
            />
          </View>
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Icon name="volume-high" size={24} color="#333" />
              <Text style={styles.settingText}>Sound</Text>
            </View>
            <Switch
              value={notifications.soundEnabled}
              onValueChange={() => toggleSwitch('soundEnabled')}
              trackColor={{false: '#D1D1D6', true: '#007AFF'}}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notification Types</Text>
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Icon name="bike" size={24} color="#333" />
              <Text style={styles.settingText}>Ride Updates</Text>
            </View>
            <Switch
              value={notifications.rideUpdates}
              onValueChange={() => toggleSwitch('rideUpdates')}
              trackColor={{false: '#D1D1D6', true: '#007AFF'}}
            />
          </View>
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Icon name="tag" size={24} color="#333" />
              <Text style={styles.settingText}>Promotions</Text>
            </View>
            <Switch
              value={notifications.promotions}
              onValueChange={() => toggleSwitch('promotions')}
              trackColor={{false: '#D1D1D6', true: '#007AFF'}}
            />
          </View>
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Icon name="newspaper" size={24} color="#333" />
              <Text style={styles.settingText}>News and Tips</Text>
            </View>
            <Switch
              value={notifications.newsAndTips}
              onValueChange={() => toggleSwitch('newsAndTips')}
              trackColor={{false: '#D1D1D6', true: '#007AFF'}}
            />
          </View>
        </View>
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
  },
  settingText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 15,
  },
});
