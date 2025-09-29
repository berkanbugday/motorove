import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  FlatList,
} from 'react-native';
import {useAuth} from '@contexts';
import {colors, commonStyles, getShadow, radius, spacing} from '@theme';
import {
  Icon,
  Tabs,
  Chip,
  Button,
  TopHeaderBar,
  BodySmall,
  Title,
} from '@components';
import {useNavigation} from '@react-navigation/native';

// Define the tabs for the profile content
type ProfileTab = 'routes' | 'history' | 'groups';

/**
 * Profile Screen - Shows user profile and account management
 */
export const ProfileScreen = () => {
  const {user, signOut} = useAuth();
  const [activeTab, setActiveTab] = useState<ProfileTab>('routes');
  const navigation = useNavigation();
  // Mock profile data
  const profileData = {
    name: `${user?.firstName} ${user?.lastName}`,
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
                <Icon
                  name="map-pin-filled"
                  size={14}
                  color={colors.neutral.grey}
                />
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
    <View style={styles.container}>
      <TopHeaderBar
        title="Profile"
        showBackButton
        onBackPress={() => navigation.goBack()}
        showShadow={false}
        containerStyle={styles.topHeaderBar}
      />
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View>
              <Image
                source={
                  user?.avatar
                    ? {uri: user?.avatar}
                    : require('@assets/images/default_avatar.png')
                }
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
              <Title weight="bold" style={{marginBottom: spacing.xs}}>
                {`${user?.firstName} ${user?.lastName}`}
              </Title>
              <View style={styles.locationContainer}>
                <Icon name="map-pin-filled" size={16} />
                <BodySmall color={colors.neutral.grey}>
                  {profileData.location}
                </BodySmall>
              </View>
              <FlatList
                data={[
                  {id: '1', label: profileData.riderType},
                  {id: '2', label: 'Adventure Rider'},
                  {id: '3', label: 'Sport Rider'},
                ]}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={item => item.id}
                renderItem={({item, index}) => (
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                    }}>
                    <BodySmall
                      style={{
                        textDecorationLine: 'underline',
                        paddingRight: spacing.sm,
                      }}>
                      {item.label}
                    </BodySmall>
                    {index < 2 && <View style={styles.dot} />}
                  </View>
                )}
              />
            </View>
          </View>

          <Text style={styles.bioText}>{profileData.bio}</Text>
          <View
            style={{
              flexDirection: 'row',
              gap: spacing.sm,
              flexWrap: 'wrap',
            }}>
            <Chip
              label={'Custom Motorcycles'}
              color="secondary"
              size="small"
              variant="filled"
            />
            <Chip
              label={profileData.riderType}
              color="secondary"
              size="small"
              variant="filled"
            />
            <Chip
              label={profileData.riderType}
              color="secondary"
              size="small"
              variant="filled"
            />
          </View>
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

        <View style={styles.logoutContainer}>
          <Button
            variant="outline"
            shape="round"
            title="Logout"
            onPress={() => signOut()}
            iconName="user-slash-filled"
            iconPosition="left"
          />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...commonStyles.container,
  },
  topHeaderBar: {
    borderBottomWidth: 1,
    borderBottomColor: colors.secondary.main,
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
  avatar: {
    width: 100,
    height: 100,
    borderRadius: radius.round,
    borderWidth: 1,
    borderColor: colors.neutral.black,
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
    flex: 1,
    marginBottom: spacing.sm,
    marginLeft: spacing.md,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
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
    ...getShadow('medium'),
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
  chipContainer: {
    paddingHorizontal: spacing.sm,
  },
  chipWrapper: {
    marginRight: spacing.sm,
  },
  logoutContainer: {
    padding: spacing.md,
    alignItems: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.xl,
  },
  dot: {
    width: spacing.xs,
    height: spacing.xs,
    borderRadius: radius.round,
    backgroundColor: colors.neutral.lightGrey,
    marginRight: spacing.sm,
  },
});
