import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Image,
  ScrollView,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useAuth} from '@contexts';
import {colors, spacing} from '@theme';
import {loggingService} from '@services/logging.service';
import {Icon} from '@components/Icon';
import {Tabs} from '@components/Tab';

// Define the tabs for the profile content
type ProfileTab = 'stats' | 'rides' | 'settings';

/**
 * Profile Screen - Shows user profile and account management
 */
export const ProfileScreen: React.FC = () => {
  const {user, signOut} = useAuth();
  const [activeTab, setActiveTab] = useState<ProfileTab>('stats');

  // Mock statistics data
  const userStats = {
    totalRides: 24,
    totalDistance: '1,245 km',
    averageSpeed: '65 km/h',
    longestRide: '180 km',
    favoriteBike: 'BMW R 1250 GS',
    ridesThisMonth: 5,
  };

  // Mock saved rides data
  const savedRides = [
    {
      id: '1',
      name: 'Coastal Highway',
      distance: '85 km',
      duration: '1h 45m',
      date: '2023-06-12',
      image: 'https://picsum.photos/id/83/500/300',
    },
    {
      id: '2',
      name: 'Mountain Loop',
      distance: '120 km',
      duration: '2h 30m',
      date: '2023-05-28',
      image: 'https://picsum.photos/id/29/500/300',
    },
    {
      id: '3',
      name: 'City Tour',
      distance: '42 km',
      duration: '1h 10m',
      date: '2023-05-15',
      image: 'https://picsum.photos/id/42/500/300',
    },
  ];

  // Mock settings menu items with valid IconName values
  const settingsMenuItems = [
    {
      id: 'account',
      title: 'Account',
      icon: 'user' as const,
      action: () => Alert.alert('Account', 'Account settings will be opened'),
    },
    {
      id: 'notifications',
      title: 'Notifications',
      icon: 'bell' as const,
      action: () =>
        Alert.alert('Notifications', 'Notification settings will be opened'),
    },
    {
      id: 'privacy',
      title: 'Privacy',
      icon: 'user-gear' as const, // Using 'user-gear' instead of 'lock'
      action: () => Alert.alert('Privacy', 'Privacy settings will be opened'),
    },
    {
      id: 'appearance',
      title: 'Appearance',
      icon: 'eye' as const,
      action: () =>
        Alert.alert('Appearance', 'Appearance settings will be opened'),
    },
    {
      id: 'help',
      title: 'Help & Support',
      icon: 'comment' as const, // Using 'comment' instead of 'help-circle'
      action: () => Alert.alert('Help', 'Help & Support will be opened'),
    },
    {
      id: 'about',
      title: 'About',
      icon: 'user-gear-filled' as const, // Using 'user-gear-filled' instead of 'info'
      action: () => Alert.alert('About', 'About will be opened'),
    },
  ];

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
              // Navigation will be handled by RootNavigator when auth state changes
            } catch (error) {
              loggingService.error('Error logging out:', error);
              Alert.alert('Error', 'Failed to logout. Please try again.');
            }
          },
        },
      ],
      {cancelable: true},
    );
  };

  const renderStatsTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.statsGrid}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{userStats.totalRides}</Text>
          <Text style={styles.statLabel}>Total Rides</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{userStats.totalDistance}</Text>
          <Text style={styles.statLabel}>Distance</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{userStats.averageSpeed}</Text>
          <Text style={styles.statLabel}>Avg. Speed</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{userStats.longestRide}</Text>
          <Text style={styles.statLabel}>Longest Ride</Text>
        </View>
      </View>

      <View style={styles.rideStats}>
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        <View style={styles.recentActivity}>
          <Icon name="route" size={24} color={colors.primary.main} />
          <View style={styles.activityText}>
            <Text style={styles.activityTitle}>
              {userStats.ridesThisMonth} rides this month
            </Text>
            <Text style={styles.activitySubtitle}>
              You've been more active than 65% of users
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.bikeInfo}>
        <Text style={styles.sectionTitle}>Your Bike</Text>
        <View style={styles.bikeCard}>
          <Image
            source={{uri: 'https://picsum.photos/id/133/500/300'}}
            style={styles.bikeImage}
          />
          <Text style={styles.bikeName}>{userStats.favoriteBike}</Text>
          <TouchableOpacity style={styles.bikeButton}>
            <Text style={styles.bikeButtonText}>Edit Bike Details</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderRidesTab = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Saved Routes</Text>
      {savedRides.map(ride => (
        <TouchableOpacity key={ride.id} style={styles.rideCard}>
          <Image source={{uri: ride.image}} style={styles.rideImage} />
          <View style={styles.rideInfo}>
            <Text style={styles.rideName}>{ride.name}</Text>
            <View style={styles.rideDetails}>
              <View style={styles.rideDetail}>
                <Icon name="route" size={14} color={colors.neutral.grey} />
                <Text style={styles.rideDetailText}>{ride.distance}</Text>
              </View>
              <View style={styles.rideDetail}>
                <Icon name="clock" size={14} color={colors.neutral.grey} />
                <Text style={styles.rideDetailText}>{ride.duration}</Text>
              </View>
              <View style={styles.rideDetail}>
                <Icon name="map-pin" size={14} color={colors.neutral.grey} />
                <Text style={styles.rideDetailText}>{ride.date}</Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      ))}

      <TouchableOpacity style={styles.findMoreButton}>
        <Text style={styles.findMoreButtonText}>Find More Routes</Text>
      </TouchableOpacity>
    </View>
  );

  const renderSettingsTab = () => (
    <View style={styles.tabContent}>
      {settingsMenuItems.map(item => (
        <TouchableOpacity
          key={item.id}
          style={styles.settingsItem}
          onPress={item.action}>
          <View style={styles.settingsItemContent}>
            <View style={styles.settingsItemIcon}>
              <Icon name={item.icon} size={20} color={colors.primary.main} />
            </View>
            <Text style={styles.settingsItemText}>{item.title}</Text>
          </View>
          <Icon name="chevron-down" size={18} color={colors.neutral.grey} />
        </TouchableOpacity>
      ))}

      <TouchableOpacity
        style={[styles.settingsItem, styles.logoutSettingsItem]}
        onPress={handleLogout}
        testID="logout-button">
        <View style={styles.settingsItemContent}>
          <View style={[styles.settingsItemIcon, styles.logoutIcon]}>
            <Icon name="users" size={20} color={colors.status.error} />
          </View>
          <Text style={[styles.settingsItemText, styles.logoutText]}>
            Logout
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );

  const tabItems = [
    {
      key: 'stats',
      label: 'Overview',
      content: renderStatsTab(),
    },
    {
      key: 'rides',
      label: 'My Rides',
      content: renderRidesTab(),
    },
    {
      key: 'settings',
      label: 'Settings',
      content: renderSettingsTab(),
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <View style={styles.profileInfo}>
            <Image
              source={{
                uri: user?.avatar || 'https://picsum.photos/id/1005/200/200',
              }}
              style={styles.avatar}
            />
            <View style={styles.userDetails}>
              <Text style={styles.userName}>
                {user?.firstName
                  ? `${user.firstName} ${user.lastName || ''}`
                  : 'Rider'}
              </Text>
              <Text style={styles.userLocation}>Istanbul, Turkey</Text>
              <TouchableOpacity style={styles.editButton}>
                <Text style={styles.editButtonText}>Edit Profile</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <Tabs
          items={tabItems}
          selectedKey={activeTab}
          onTabChange={tab => setActiveTab(tab as ProfileTab)}
          variant="pill"
          equalWidth
          containerStyle={styles.tabContainer}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral.white,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: spacing.md,
    paddingTop: spacing.xl,
    backgroundColor: colors.primary.light,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    marginBottom: spacing.md,
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: colors.neutral.white,
  },
  userDetails: {
    marginLeft: spacing.md,
  },
  userName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.neutral.white,
    marginBottom: spacing.xs / 2,
  },
  userLocation: {
    fontSize: 14,
    color: colors.neutral.white,
    marginBottom: spacing.sm,
    opacity: 0.8,
  },
  editButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: spacing.xs / 2,
    paddingHorizontal: spacing.sm,
    borderRadius: 16,
  },
  editButtonText: {
    color: colors.neutral.white,
    fontSize: 12,
    fontWeight: '600',
  },
  tabContainer: {
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  tabContent: {
    padding: spacing.md,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: spacing.md,
  },
  statItem: {
    width: '50%',
    padding: spacing.sm,
    marginBottom: spacing.sm,
  },
  statValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.neutral.black,
    marginBottom: spacing.xs / 2,
  },
  statLabel: {
    fontSize: 14,
    color: colors.neutral.grey,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: spacing.md,
    color: colors.neutral.black,
  },
  rideStats: {
    marginBottom: spacing.lg,
  },
  recentActivity: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral.white,
    padding: spacing.md,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  activityText: {
    marginLeft: spacing.md,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.neutral.black,
    marginBottom: 4,
  },
  activitySubtitle: {
    fontSize: 14,
    color: colors.neutral.grey,
  },
  bikeInfo: {
    marginBottom: spacing.lg,
  },
  bikeCard: {
    backgroundColor: colors.neutral.white,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  bikeImage: {
    width: '100%',
    height: 150,
    resizeMode: 'cover',
  },
  bikeName: {
    fontSize: 16,
    fontWeight: '600',
    padding: spacing.md,
    color: colors.neutral.black,
  },
  bikeButton: {
    backgroundColor: colors.primary.main,
    padding: spacing.sm,
    alignItems: 'center',
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  bikeButtonText: {
    color: colors.neutral.white,
    fontWeight: '600',
  },
  rideCard: {
    flexDirection: 'row',
    backgroundColor: colors.neutral.white,
    borderRadius: 12,
    marginBottom: spacing.md,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  rideImage: {
    width: 100,
    height: 100,
    resizeMode: 'cover',
  },
  rideInfo: {
    flex: 1,
    padding: spacing.md,
    justifyContent: 'center',
  },
  rideName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.neutral.black,
    marginBottom: spacing.sm,
  },
  rideDetails: {
    flexDirection: 'column',
  },
  rideDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  rideDetailText: {
    marginLeft: spacing.xs,
    fontSize: 14,
    color: colors.neutral.grey,
  },
  findMoreButton: {
    backgroundColor: colors.neutral.white,
    borderWidth: 1,
    borderColor: colors.primary.main,
    borderRadius: 8,
    padding: spacing.sm,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  findMoreButtonText: {
    color: colors.primary.main,
    fontWeight: '600',
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral.lightGrey,
  },
  settingsItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingsItemIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary.light,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  settingsItemText: {
    fontSize: 16,
    color: colors.neutral.black,
  },
  logoutSettingsItem: {
    marginTop: spacing.md,
    borderBottomWidth: 0,
  },
  logoutIcon: {
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
  },
  logoutText: {
    color: colors.status.error,
  },
});
