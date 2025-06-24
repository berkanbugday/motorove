import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {MainScreenNavigationProp} from '@navigation/types/navigationTypes';
import {Icon} from '@components/Icon';
import {Typography} from '@components/Typography';
import {colors} from '@theme/colors';
import {spacing} from '@theme/spacing';
import {radius} from '@theme/radius';
import {useAuth} from '@contexts';

type MenuSection = {
  title: string;
  items: MenuItem[];
};

type MenuItem = {
  icon: React.ReactNode;
  title: string;
  onPress: () => void;
  showBadge?: boolean;
};

export const MoreScreen: React.FC = () => {
  const navigation = useNavigation<MainScreenNavigationProp<'Notification'>>();
  const {signOut} = useAuth();

  const handleProfilePress = () => {
    // Navigate to profile screen when implemented
    // navigation.navigate('Profile', {userId: user?.id});
  };

  const handleCreateEventPress = () => {
    navigation.navigate('CreateEvent');
  };

  const handleSettingsPress = () => {
    // Navigate to settings screen when implemented
    // navigation.navigate('Settings');
  };

  const handleNotificationsPress = () => {
    navigation.navigate('Notification');
  };

  const menuSections: MenuSection[] = [
    {
      title: 'Profile',
      items: [
        {
          icon: (
            <Icon name="user-filled" size={20} color={colors.neutral.black} />
          ),
          title: 'My Profile',
          onPress: handleProfilePress,
        },
        {
          icon: (
            <Icon name="bell-filled" size={20} color={colors.neutral.black} />
          ),
          title: 'Notifications',
          onPress: handleNotificationsPress,
          showBadge: false, // Set to true when you have unread notifications
        },
        {
          icon: (
            <Icon name="gear-filled" size={20} color={colors.neutral.black} />
          ),
          title: 'Settings',
          onPress: handleSettingsPress,
        },
      ],
    },
    {
      title: 'Events',
      items: [
        {
          icon: (
            <Icon
              name="calendar-filled"
              size={20}
              color={colors.neutral.black}
            />
          ),
          title: 'Create Event',
          onPress: handleCreateEventPress,
        },
        {
          icon: (
            <Icon name="clock-filled" size={20} color={colors.neutral.black} />
          ),
          title: 'My Events',
          onPress: () => {
            // Navigate to my events when implemented
            // navigation.navigate('MyEvents');
          },
        },
      ],
    },
    {
      title: 'Account',
      items: [
        {
          icon: (
            <Icon name="lock-filled" size={20} color={colors.neutral.black} />
          ),
          title: 'Privacy Policy',
          onPress: () => {
            // Open privacy policy
            // navigation.navigate('PrivacyPolicy');
          },
        },
        {
          icon: (
            <Icon name="earth-filled" size={20} color={colors.neutral.black} />
          ),
          title: 'Terms of Service',
          onPress: () => {
            // Open terms of service
            // navigation.navigate('TermsOfService');
          },
        },
        {
          icon: (
            <Icon name="error-filled" size={20} color={colors.status.error} />
          ),
          title: 'Sign Out',
          onPress: signOut,
        },
      ],
    },
  ];

  const renderMenuItem = (item: MenuItem) => (
    <TouchableOpacity
      key={item.title}
      style={styles.menuItem}
      onPress={item.onPress}>
      <View style={styles.menuItemContent}>
        {item.icon}
        <Typography style={styles.menuItemText} variant="body">
          {item.title}
        </Typography>
      </View>
      <View style={styles.menuItemRight}>
        {item.showBadge && <View style={styles.badge} />}
        <Icon
          name="chevron-down"
          size={20}
          color={colors.neutral.grey}
          style={styles.chevron}
        />
      </View>
    </TouchableOpacity>
  );

  const renderSection = (section: MenuSection, index: number) => (
    <View
      key={section.title}
      style={[styles.section, index > 0 && styles.sectionMargin]}>
      <Typography variant="subtitle" style={styles.sectionTitle}>
        {section.title}
      </Typography>
      <View style={styles.sectionContent}>
        {section.items.map(renderMenuItem)}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Typography variant="title" style={styles.headerTitle}>
          More
        </Typography>
      </View>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}>
        {menuSections.map(renderSection)}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral.background,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.neutral.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral.veryLightGrey,
  },
  headerTitle: {
    color: colors.neutral.black,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
  },
  section: {
    width: '100%',
  },
  sectionMargin: {
    marginTop: spacing.xl,
  },
  sectionTitle: {
    color: colors.neutral.black,
    marginBottom: spacing.sm,
  },
  sectionContent: {
    backgroundColor: colors.neutral.white,
    borderRadius: radius.md,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral.veryLightGrey,
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemText: {
    marginLeft: spacing.md,
    color: colors.neutral.black,
  },
  menuItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chevron: {
    transform: [{rotate: '-90deg'}],
  },
  badge: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary.main,
    marginRight: spacing.sm,
  },
});
