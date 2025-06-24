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
import {useAuth} from '@contexts';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

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
  const insets = useSafeAreaInsets();

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
            <Icon name="user-filled" size={18} color={colors.neutral.black} />
          ),
          title: 'My Profile',
          onPress: handleProfilePress,
        },
        {
          icon: (
            <Icon name="bell-filled" size={18} color={colors.neutral.black} />
          ),
          title: 'Notifications',
          onPress: handleNotificationsPress,
          showBadge: false, // Set to true when you have unread notifications
        },
        {
          icon: (
            <Icon name="gear-filled" size={18} color={colors.neutral.black} />
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
              size={18}
              color={colors.neutral.black}
            />
          ),
          title: 'Create Event',
          onPress: handleCreateEventPress,
        },
        {
          icon: (
            <Icon name="clock-filled" size={18} color={colors.neutral.black} />
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
            <Icon name="lock-filled" size={18} color={colors.neutral.black} />
          ),
          title: 'Privacy Policy',
          onPress: () => {
            // Open privacy policy
            // navigation.navigate('PrivacyPolicy');
          },
        },
        {
          icon: (
            <Icon name="earth-filled" size={18} color={colors.neutral.black} />
          ),
          title: 'Terms of Service',
          onPress: () => {
            // Open terms of service
            // navigation.navigate('TermsOfService');
          },
        },
        {
          icon: (
            <Icon name="error-filled" size={18} color={colors.status.error} />
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
          size={18}
          color={colors.neutral.grey}
          style={styles.chevron}
        />
      </View>
    </TouchableOpacity>
  );

  const renderSection = (section: MenuSection, index: number) => (
    <View key={section.title} style={[index > 0 && styles.sectionMargin]}>
      <Typography variant="subtitle" weight="semiBold">
        {section.title}
      </Typography>
      {section.items.map(renderMenuItem)}
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, {paddingTop: insets.top}]}>
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          {paddingBottom: insets.bottom + 100},
        ]}>
        {menuSections.map(renderSection)}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral.white,
  },

  scrollContent: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
  },

  sectionMargin: {
    marginTop: spacing.xl,
  },

  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.secondary.main,
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemText: {
    marginLeft: spacing.md,
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
