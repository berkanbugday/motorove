import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useAuth} from '@contexts';
import {colors, radius, spacing} from '@theme';
import {Icon} from '@components/Icon';
import {Tabs} from '@components/Tab';
import {Chip} from '@components/Chip';
import {Button} from '@components/Button';

// Define the tabs for the profile content
type ProfileTab = 'routes' | 'history' | 'groups';

/**
 * Profile Screen - Shows user profile and account management
 */
export const ProfileScreen: React.FC = () => {
  const {user} = useAuth();
  const [activeTab, setActiveTab] = useState<ProfileTab>('routes');

  // Mock profile data
  const profileData = {
    name: 'Michael Thompson',
    username: '@roadmaster_mike',
    isPremium: true,
    location: 'San Francisco, CA',
    bio: 'Passionate motorcycle enthusiast exploring the West Coast. Adventure seeker and photography lover.',
    riderType: 'Touring Rider',
    totalKm: '12,458',
    routes: '47',
    events: '28',
    following: '283',
    followers: '100',
  };

  // Mock routes data
  const routes = [
    {
      id: '1',
      name: 'Pacific Coast Highway',
      distance: '385 km',
      duration: '5h 20m',
      date: '2023-07-15',
      image: 'https://picsum.photos/id/83/500/300',
    },
    {
      id: '2',
      name: 'Sierra Nevada Loop',
      distance: '290 km',
      duration: '4h 10m',
      date: '2023-06-28',
      image: 'https://picsum.photos/id/29/500/300',
    },
    {
      id: '3',
      name: 'Bay Area Tour',
      distance: '120 km',
      duration: '2h 45m',
      date: '2023-06-02',
      image: 'https://picsum.photos/id/42/500/300',
    },
  ];

  const renderRoutesTab = () => (
    <View style={styles.tabContent}>
      {routes.map(route => (
        <TouchableOpacity key={route.id} style={styles.routeCard}>
          <Image source={{uri: route.image}} style={styles.routeImage} />
          <View style={styles.routeInfo}>
            <Text style={styles.routeName}>{route.name}</Text>
            <View style={styles.routeDetails}>
              <View style={styles.routeDetail}>
                <Icon name="route" size={14} color={colors.neutral.grey} />
                <Text style={styles.routeDetailText}>{route.distance}</Text>
              </View>
              <View style={styles.routeDetail}>
                <Icon name="clock" size={14} color={colors.neutral.grey} />
                <Text style={styles.routeDetailText}>{route.duration}</Text>
              </View>
              <View style={styles.routeDetail}>
                <Icon name="map-pin" size={14} color={colors.neutral.grey} />
                <Text style={styles.routeDetailText}>{route.date}</Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderHistoryTab = () => (
    <View style={styles.tabContent}>
      <Text style={styles.emptyTabText}>
        Your ride history will appear here
      </Text>
    </View>
  );

  const renderGroupsTab = () => (
    <View style={styles.tabContent}>
      <Text style={styles.emptyTabText}>Your groups will appear here</Text>
    </View>
  );

  const tabItems = [
    {
      key: 'routes',
      label: 'Routes',
      content: renderRoutesTab(),
    },
    {
      key: 'history',
      label: 'History',
      content: renderHistoryTab(),
    },
    {
      key: 'groups',
      label: 'Groups',
      content: renderGroupsTab(),
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View style={styles.profileImageContainer}>
              <Image
                source={{
                  uri: user?.avatar || 'https://picsum.photos/id/1005/200/200',
                }}
                style={styles.avatar}
              />
              <View style={styles.cameraIconContainer}>
                <Button
                  variant="text"
                  shape="circle"
                  size="small"
                  onPress={() => {}}
                  iconName="camera-filled"
                  iconSize={14}
                  iconColor={colors.neutral.white}
                />
              </View>
            </View>
            <View style={styles.profileHeader}>
              <Text style={styles.userName}>{profileData.name}</Text>
              <View style={styles.usernameContainer}>
                <Text style={styles.userHandle}>{profileData.username}</Text>
              </View>
              {profileData.isPremium && (
                <Chip
                  label="Premium"
                  color="primary"
                  size="small"
                  leadingIcon="crown-filled"
                  style={styles.premiumBadge}
                  variant="filled"
                  labelStyle={styles.premiumText}
                />
              )}
            </View>
          </View>

          <View style={styles.locationContainer}>
            <Icon name="map-pin" size={16} color={colors.neutral.grey} />
            <Text style={styles.locationText}>{profileData.location}</Text>
          </View>

          <Text style={styles.bioText}>{profileData.bio}</Text>

          <Chip
            label={profileData.riderType}
            color="secondary"
            size="small"
            variant="filled"
          />

          <View style={styles.statsContainer}>
            <View style={styles.statItemRow}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{profileData.totalKm}</Text>
                <Text style={styles.statLabel}>Total KM</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{profileData.routes}</Text>
                <Text style={styles.statLabel}>Routes</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{profileData.events}</Text>
                <Text style={styles.statLabel}>Events</Text>
              </View>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.statItemRow}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{profileData.following}</Text>
                <Text style={styles.statLabel}>Following</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{profileData.followers}</Text>
                <Text style={styles.statLabel}>Followers</Text>
              </View>
            </View>
          </View>

          <View style={styles.editProfileButtonContainer}>
            <Button
              variant="dark"
              shape="round"
              title="Edit Profile"
              onPress={() => {}}
              style={styles.editProfileButton}
            />
            <Button
              variant="secondary"
              shape="circle"
              size="small"
              onPress={() => {}}
              iconName="gear-filled"
              iconSize={20}
            />
          </View>
        </View>

        <Tabs
          items={tabItems}
          selectedKey={activeTab}
          onTabChange={tab => setActiveTab(tab as ProfileTab)}
          variant="underlined"
          equalWidth
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
    backgroundColor: colors.neutral.white,
    marginBottom: spacing.md,
  },
  headerTop: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  profileImageContainer: {
    position: 'relative',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  cameraIconContainer: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    backgroundColor: colors.neutral.black,
    borderRadius: radius.round,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.neutral.lightGrey,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileHeader: {
    marginBottom: spacing.sm,
    marginLeft: spacing.sm,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.neutral.black,
    marginBottom: spacing.xs,
  },
  usernameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userHandle: {
    fontSize: 16,
    color: colors.neutral.grey,
    marginRight: spacing.sm,
  },
  premiumBadge: {
    marginTop: spacing.xs,
    backgroundColor: colors.primary.light,
  },
  premiumText: {
    fontWeight: 'bold',
    fontSize: 10,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  locationText: {
    fontSize: 14,
    color: colors.neutral.grey,
    marginLeft: spacing.xs,
  },
  bioText: {
    fontSize: 14,
    color: colors.neutral.black,
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  statsContainer: {
    backgroundColor: colors.neutral.white,
    borderRadius: 12,
    padding: spacing.sm,
    marginBottom: spacing.md,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    padding: spacing.sm,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.neutral.black,
    marginBottom: spacing.xs / 2,
  },
  statLabel: {
    fontSize: 14,
    color: colors.neutral.grey,
  },
  statDivider: {
    height: 1,
    backgroundColor: colors.neutral.lightGrey,
    marginVertical: spacing.xs,
  },
  editProfileButtonContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  editProfileButton: {
    width: '70%',
  },
  tabContent: {
    padding: spacing.md,
  },
  routeCard: {
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
  routeImage: {
    width: 100,
    height: 100,
    resizeMode: 'cover',
  },
  routeInfo: {
    flex: 1,
    padding: spacing.md,
    justifyContent: 'center',
  },
  routeName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.neutral.black,
    marginBottom: spacing.sm,
  },
  routeDetails: {
    flexDirection: 'column',
  },
  routeDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  routeDetailText: {
    marginLeft: spacing.xs,
    fontSize: 14,
    color: colors.neutral.grey,
  },
  emptyTabText: {
    textAlign: 'center',
    color: colors.neutral.grey,
    fontSize: 16,
    marginTop: spacing.xl,
  },
});
