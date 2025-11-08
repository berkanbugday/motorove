import React from 'react';
import {
  View,
  TouchableOpacity,
  Image,
  ImageSourcePropType,
  StyleProp,
  ViewStyle,
} from 'react-native';
import {Typography, Button, Icon, IconName} from '@components';
import {colors} from '@theme';
import {styles} from './GroupCard.styles';
import {GroupPrivacy} from '@motorove/shared';
import {EnumUtils} from '@utils/enumUtils';
import {useTranslation} from '@hooks/useTranslation';

export interface BadgeProps {
  /**
   * Text to display in the badge
   */
  text: string;

  /**
   * Optional custom background color for the badge
   */
  backgroundColor?: string;

  /**
   * Optional custom text color for the badge
   */
  textColor?: string;
}

export interface GroupCardProps {
  /**
   * Group logo/avatar image source
   */
  logoSource: ImageSourcePropType | null;

  /**
   * Name of the group/club
   */
  name: string;

  /**
   * Location of the group (e.g. "Colorado Springs, CO")
   */
  location: string;

  /**
   * Tags or categories for the group (e.g. "Touring", "Off-Road")
   */
  tags?: string[];

  /**
   * Number of current members in the group
   */
  currentMembers?: number | null;

  /**
   * Maximum number of members allowed in the group
   */
  membersCapacity?: number | null;

  /**
   * Privacy level of the group
   */
  privacy?: GroupPrivacy;

  /**
   * Badge to display on the card (e.g. "Official", "Featured", etc.)
   */
  badge?: BadgeProps;

  /**
   * Handler for when the card is pressed
   */
  onPress?: () => void;

  /**
   * Handler for when the join button is pressed
   */
  onJoinPress?: () => void;

  /**
   * Additional styles for the card container
   */
  style?: StyleProp<ViewStyle>;

  /**
   * Whether the user is already a member of this group
   */
  isMember?: boolean;
}

/**
 * A reusable card component for displaying group/club information.
 */
export const GroupCard: React.FC<GroupCardProps> = ({
  logoSource,
  name,
  location,
  tags = [],
  currentMembers = 0,
  membersCapacity,
  privacy = GroupPrivacy.PUBLIC,
  badge,
  onPress,
  onJoinPress,
  style,
  isMember = true,
}) => {
  const {t} = useTranslation();
  const handlePress = () => {
    if (onPress) {
      onPress();
    }
  };

  const handleJoinPress = () => {
    if (onJoinPress) {
      onJoinPress();
    }
  };

  const renderBadge = () => {
    if (!badge) {
      return null;
    }

    return (
      <View
        style={[
          styles.badge,
          badge.backgroundColor && {backgroundColor: badge.backgroundColor},
        ]}>
        <Typography
          variant="caption"
          color={badge.textColor || colors.neutral.white}
          weight="bold">
          {badge.text}
        </Typography>
      </View>
    );
  };

  const renderTags = () => {
    if (!tags.length) {
      return null;
    }

    return (
      <View style={styles.tagsContainer}>
        {tags.map((tag, index) => (
          <React.Fragment key={tag}>
            <Typography
              variant="caption"
              color={colors.neutral.darkGrey}
              style={{
                textDecorationLine: 'underline',
              }}>
              {tag}
            </Typography>
            {index < tags.length - 1 && (
              <Typography
                variant="caption"
                color={colors.neutral.darkGrey}
                style={styles.tagSeparator}>
                •
              </Typography>
            )}
          </React.Fragment>
        ))}
      </View>
    );
  };

  const renderMemberCount = () => {
    const memberText = membersCapacity
      ? `${currentMembers} ${t(
          'components.groupCard.member',
        )} / ${membersCapacity} ${t('components.groupCard.members_capacity')} `
      : `${currentMembers} ${t('components.groupCard.member')}`;

    return (
      <View style={styles.memberContainer}>
        <Icon name="users-filled" size={12} />
        <Typography
          variant="caption"
          color={colors.neutral.darkGrey}
          style={styles.infoText}>
          {memberText}
        </Typography>
      </View>
    );
  };

  const renderPrivacyBadge = () => {
    let iconName: IconName = 'lock-open-filled';

    if (privacy === GroupPrivacy.PRIVATE) {
      iconName = 'lock-filled';
    }

    return (
      <View style={styles.privacyContainer}>
        <Icon name={iconName} size={12} />
        <Typography
          variant="caption"
          color={colors.neutral.darkGrey}
          style={styles.infoText}>
          {EnumUtils.convertGroupPrivacy(privacy)}
        </Typography>
      </View>
    );
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      style={[styles.container, style]}
      activeOpacity={0.8}>
      {renderBadge()}
      <View style={styles.content}>
        <Image source={logoSource || undefined} style={styles.logo} />
        <View style={styles.infoContainer}>
          <Typography variant="subtitle" weight="bold" numberOfLines={1}>
            {name}
          </Typography>
          {location && (
            <View style={styles.locationContainer}>
              <Icon
                name="map-pin-filled"
                size={12}
                color={colors.neutral.grey}
              />
              <Typography
                variant="caption"
                color={colors.neutral.darkGrey}
                style={styles.infoText}
                numberOfLines={1}>
                {location}, {t('common.country')}
              </Typography>
            </View>
          )}
          {renderTags()}
          <View style={styles.bottomRow}>
            {renderMemberCount()}
            {renderPrivacyBadge()}
          </View>
        </View>
        <View style={styles.joinButtonContainer}>
          {!isMember ? (
            <Button
              title={t('common.join')}
              variant="dark"
              size="small"
              shape="round"
              onPress={handleJoinPress}
            />
          ) : null}
        </View>
      </View>
    </TouchableOpacity>
  );
};
