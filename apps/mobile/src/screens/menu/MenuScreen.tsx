import React from 'react';
import {View, StyleSheet, FlatList, TouchableOpacity} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {MainScreenNavigationProp} from '@navigation/types/navigationTypes';
import {Icon} from '@components/Icon';
import {Body, Subtitle, useBottomSheet, LanguageSelector} from '@components';
import {colors, commonStyles, radius, spacing} from '@theme';
import {useAuth} from '@contexts';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useTranslation} from '@hooks/useTranslation';
import {useUpdateUserSetting} from '@services/user-setting.service';
import {Language} from '@motorove/shared';

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

export const MenuScreen = () => {
  const navigation = useNavigation<MainScreenNavigationProp<'Tabs'>>();
  const {user, signOut} = useAuth();
  const insets = useSafeAreaInsets();
  const {t} = useTranslation();
  const {openBottomSheet, closeBottomSheet} = useBottomSheet();
  const {updateUserSetting} = useUpdateUserSetting();

  const handleLanguagePress = () => {
    openBottomSheet({
      content: (
        <LanguageSelector
          onLanguageSelect={async (languageCode: string) => {
            closeBottomSheet();

            // Convert language code to Language enum
            const preferredLanguage = languageCode.toUpperCase() as Language;

            // Update user setting with preferred language
            await updateUserSetting({
              preferredLanguage,
            });
          }}
        />
      ),
      snapPoint: 'minimal',
      title: t('screens.menu.language_selection'),
      showCloseButton: true,
      closeButtonPosition: 'top-right',
    });
  };

  const menuSections: MenuSection[] = [
    {
      title: t('screens.menu.general'),
      items: [
        {
          icon: (
            <Icon
              name="id-card-filled"
              size={18}
              color={colors.neutral.black}
            />
          ),
          title: t('screens.menu.my_profile'),
          onPress: () => {
            navigation.navigate('Profile', {
              userId: user?.id,
            });
          },
          showRightIcon: true,
        },
        // {
        //   icon: (
        //     <Icon name="garage-filled" size={18} color={colors.neutral.black} />
        //   ),
        //   title: t('screens.menu.my_garage'),
        //   onPress: () => {
        //     navigation.navigate('Garage');
        //   },
        //   showRightIcon: true,
        // },
        {
          icon: (
            <Icon name="pen-filled" size={18} color={colors.neutral.black} />
          ),
          title: t('screens.menu.posts'),
          onPress: () => {
            navigation.navigate('Posts');
          },
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
          title: t('screens.menu.events'),
          onPress: () => {
            navigation.navigate('Events');
          },
          showRightIcon: true,
        },
      ],
    },
    {
      title: t('screens.menu.requests'),
      items: [
        {
          icon: (
            <Icon name="users-filled" size={18} color={colors.neutral.black} />
          ),
          title: t('screens.menu.group_join_requests'),
          onPress: () => {
            navigation.navigate('GroupJoinRequest');
          },
          showRightIcon: true,
          showBadge: false,
        },
        {
          icon: (
            <Icon
              name="calendar-filled"
              size={18}
              color={colors.neutral.black}
            />
          ),
          title: t('screens.menu.event_invitations'),
          onPress: () => {
            navigation.navigate('EventInvitation');
          },
          showRightIcon: true,
          showBadge: false,
        },
        {
          icon: (
            <Icon
              name="request-filled"
              size={18}
              color={colors.neutral.black}
            />
          ),
          title: t('screens.menu.follow_requests'),
          onPress: () => {
            navigation.navigate('FollowRequest');
          },
          showRightIcon: true,
          showBadge: false,
        },
      ],
    },
    {
      title: t('screens.menu.settings'),
      items: [
        {
          icon: (
            <Icon
              name="language-filled"
              size={18}
              color={colors.neutral.black}
            />
          ),
          title: t('screens.menu.language_selection'),
          onPress: handleLanguagePress,
          showRightIcon: true,
        },
        {
          icon: (
            <Icon name="bell-filled" size={18} color={colors.neutral.black} />
          ),
          title: t('screens.menu.notification_settings'),
          onPress: () => {
            navigation.navigate('NotificationSetting');
          },
          showRightIcon: true,
        },
        {
          icon: (
            <Icon name="lock-filled" size={18} color={colors.neutral.black} />
          ),
          title: t('screens.menu.privacy_settings'),
          onPress: () => {
            navigation.navigate('PrivacySetting');
          },
          showRightIcon: true,
        },
      ],
    },
    {
      title: t('screens.menu.support_legal'),
      items: [
        {
          icon: (
            <Icon
              name="question-filled"
              size={18}
              color={colors.neutral.black}
            />
          ),
          title: t('screens.menu.support_request'),
          onPress: () => {
            navigation.navigate('Support');
          },
          showRightIcon: true,
        },
        {
          icon: (
            <Icon name="share-filled" size={18} color={colors.neutral.black} />
          ),
          title: t('screens.menu.invite_friends'),
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
          title: t('screens.menu.terms_of_service'),
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
          title: t('screens.menu.privacy_policy'),
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
          icon: <Icon name="sign-out" size={18} color={colors.primary.main} />,
          title: t('screens.menu.sign_out'),
          onPress: () => {
            signOut();
          },
          showRightIcon: false,
        },
      ],
    },
  ];

  // Flatten menu sections into a single array for FlatList
  const flatListData = menuSections.flatMap((section, sectionIndex) => {
    const sectionItems = [];

    // Add section header if title exists
    sectionItems.push({
      type: 'header',
      title: section.title,
      sectionIndex,
    });

    // Add menu items
    section.items.forEach((item, itemIndex) => {
      sectionItems.push({
        type: 'item',
        ...item,
        sectionIndex,
        itemIndex,
      });
    });

    return sectionItems;
  });

  const renderItem = ({item, index}: {item: any; index: number}) => {
    if (item.type === 'header') {
      return (
        <View
          style={[styles.sectionHeader, index > 0 && {marginTop: spacing.xl}]}>
          <Subtitle weight="bold">{item.title}</Subtitle>
        </View>
      );
    }

    return (
      <TouchableOpacity
        style={[
          styles.menuItem,
          index === flatListData.length - 1 && {borderBottomWidth: 0},
        ]}
        onPress={item.onPress}>
        <View style={styles.menuItemContent}>
          {item.icon}
          <Body style={styles.menuItemText}>{item.title}</Body>
        </View>
        {item.showRightIcon && (
          <View style={styles.menuItemRight}>
            {item.showBadge && <View style={styles.badge} />}
            <Icon name="chevron-right" size={18} />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const keyExtractor = (item: any, _index: number) => {
    if (item.type === 'header') {
      return `header-${item.sectionIndex}`;
    }
    return `item-${item.sectionIndex}-${item.itemIndex}`;
  };

  return (
    <View style={[styles.container, {paddingTop: insets.top}]}>
      <FlatList
        data={flatListData}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          {paddingBottom: insets.bottom + 70},
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...commonStyles.container,
  },
  scrollContent: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
  },
  sectionHeader: {
    marginBottom: spacing.sm,
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
    width: spacing.sm,
    height: spacing.sm,
    borderRadius: radius.round,
    backgroundColor: colors.primary.main,
    marginRight: spacing.sm,
  },
});
