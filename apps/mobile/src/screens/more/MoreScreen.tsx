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
import {Body, Subtitle, useBottomSheet, LanguageSelector} from '@components';
import {colors, spacing} from '@theme';
import {useAuth} from '@contexts';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useTranslation} from '@/hooks/useTranslation';

type MenuSection = {
  title: string;
  items: MenuItem[];
};

type MenuItem = {
  icon: React.ReactNode;
  title: string;
  onPress: () => void;
  showBadge?: boolean;
  showRightIcon?: boolean;
};

export const MoreScreen: React.FC = () => {
  const navigation = useNavigation<MainScreenNavigationProp<'Tabs'>>();
  const {signOut} = useAuth();
  const insets = useSafeAreaInsets();
  const {t} = useTranslation();
  const {openBottomSheet, closeBottomSheet} = useBottomSheet();

  const handleProfilePress = () => {
    // Navigate to profile screen when implemented
    // navigation.navigate('Profile', {userId: user?.id});
  };

  const handleCreateEventPress = () => {
    navigation.navigate('CreateEvent');
  };

  const handleNotificationsPress = () => {
    navigation.navigate('Notification');
  };

  const handleLanguagePress = () => {
    openBottomSheet({
      content: (
        <LanguageSelector
          onLanguageSelect={() => {
            closeBottomSheet();
          }}
        />
      ),
      snapPoint: 'minimal',
      title: t('screens.more.language_selection'),
      showCloseButton: true,
      closeButtonPosition: 'top-left',
    });
  };

  const menuSections: MenuSection[] = [
    {
      title: t('screens.more.general'),
      items: [
        {
          icon: (
            <Icon
              name="id-card-filled"
              size={18}
              color={colors.neutral.black}
            />
          ),
          title: t('screens.more.my_profile'),
          onPress: handleProfilePress,
          showRightIcon: true,
        },
        {
          icon: (
            <Icon name="garage-filled" size={18} color={colors.neutral.black} />
          ),
          title: t('screens.more.my_garage'),
          onPress: handleNotificationsPress,
          showBadge: false, // Set to true when you have unread notifications
          showRightIcon: true,
        },
        {
          icon: (
            <Icon name="save-filled" size={18} color={colors.neutral.black} />
          ),
          title: t('screens.more.favorites'),
          onPress: handleNotificationsPress,
          showBadge: false, // Set to true when you have unread notifications
          showRightIcon: true,
        },
        {
          icon: (
            <Icon
              name="calendar-filled"
              size={18}
              color={colors.neutral.black}
            />
          ),
          title: t('screens.more.events'),
          onPress: handleCreateEventPress,
          showRightIcon: true,
        },
      ],
    },
    {
      title: t('screens.more.requests'),
      items: [
        {
          icon: (
            <Icon
              name="list-check-filled"
              size={18}
              color={colors.neutral.black}
            />
          ),
          title: t('screens.more.join_requests'),
          onPress: () => {
            // Navigate to my events when implemented
            // navigation.navigate('MyEvents');
          },
          showRightIcon: true,
        },
        {
          icon: (
            <Icon
              name="request-filled"
              size={18}
              color={colors.neutral.black}
            />
          ),
          title: t('screens.more.follow_requests'),
          onPress: () => {
            // Navigate to my events when implemented
            // navigation.navigate('MyEvents');
          },
          showRightIcon: true,
        },
      ],
    },
    {
      title: t('screens.more.settings'),
      items: [
        {
          icon: (
            <Icon
              name="language-filled"
              size={18}
              color={colors.neutral.black}
            />
          ),
          title: t('screens.more.language'),
          onPress: handleLanguagePress,
          showRightIcon: true,
        },
        {
          icon: (
            <Icon name="bell-filled" size={18} color={colors.neutral.black} />
          ),
          title: t('screens.more.notifications'),
          onPress: () => {
            // Open terms of service
            // navigation.navigate('TermsOfService');
          },
          showRightIcon: true,
        },
        {
          icon: (
            <Icon name="lock-filled" size={18} color={colors.neutral.black} />
          ),
          title: t('screens.more.privacy_settings'),
          onPress: () => {
            // Open terms of service
            // navigation.navigate('TermsOfService');
          },
          showRightIcon: true,
        },
      ],
    },
    {
      title: t('screens.more.support_legal'),
      items: [
        {
          icon: (
            <Icon
              name="question-filled"
              size={18}
              color={colors.neutral.black}
            />
          ),
          title: t('screens.more.contact_support'),
          onPress: () => {
            // Open privacy policy
            // navigation.navigate('PrivacyPolicy');
          },
          showRightIcon: true,
        },
        {
          icon: (
            <Icon name="share-filled" size={18} color={colors.neutral.black} />
          ),
          title: t('screens.more.invite_friends'),
          onPress: () => {
            // Open terms of service
            // navigation.navigate('TermsOfService');
          },
          showRightIcon: true,
        },
        {
          icon: (
            <Icon name="list-filled" size={18} color={colors.neutral.black} />
          ),
          title: t('screens.more.terms_of_service'),
          onPress: () => {
            // Open terms of service
            // navigation.navigate('TermsOfService');
          },
          showRightIcon: true,
        },
        {
          icon: (
            <Icon name="file-filled" size={18} color={colors.neutral.black} />
          ),
          title: t('screens.more.privacy_policy'),
          onPress: () => {
            // Open terms of service
            // navigation.navigate('TermsOfService');
          },
          showRightIcon: true,
        },
      ],
    },
    {
      title: '',
      items: [
        {
          icon: <Icon name="sign-out" size={18} color={colors.neutral.black} />,
          title: t('screens.more.sign_out'),
          onPress: () => {
            signOut();
          },
          showRightIcon: false,
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
        <Body style={styles.menuItemText}>{item.title}</Body>
      </View>
      {item.showRightIcon && (
        <View style={styles.menuItemRight}>
          {item.showBadge && <View style={styles.badge} />}
          <Icon name="chevron-right" size={18} color={colors.neutral.grey} />
        </View>
      )}
    </TouchableOpacity>
  );

  const renderSection = (section: MenuSection, index: number) => (
    <View key={section.title} style={[index > 0 && styles.sectionMargin]}>
      <Subtitle weight="semiBold">{section.title}</Subtitle>
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
  badge: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary.main,
    marginRight: spacing.sm,
  },
});
