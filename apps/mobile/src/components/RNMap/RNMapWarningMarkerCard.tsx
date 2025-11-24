import React, {useState} from 'react';
import {View, StyleSheet, TouchableOpacity} from 'react-native';
import {IWarning, Language} from '@motorove/shared';
import {StyleProp, ViewStyle} from 'react-native';
import {colors, spacing, radius, getShadow, commonStyles} from '@theme';
import {
  Title,
  Caption,
  Icon,
  Button,
  BodySmall,
  IconName,
  openMapAppsBottomSheet,
} from '@components';
import {useTranslation} from '@hooks/useTranslation';
import {EnumUtils} from '@utils/enumUtils';
import {getWarningIcon} from '@utils/warningUtils';
import {useLanguage} from '@contexts/LanguageContext';
import {formatDistanceToNow} from 'date-fns';
import {tr, enUS} from 'date-fns/locale';

/**
 * Warning marker card props
 */
export interface RNMapWarningMarkerCardProps {
  warning: IWarning;
  onPress?: () => void;
  onClose?: () => void;
  style?: StyleProp<ViewStyle>;
  userLocation?: {
    latitude: number;
    longitude: number;
  };
  showGetDirectionsButton?: boolean;
  onGetDirections?: () => void;
}

/**
 * Warning marker card component
 * Displays detailed warning information in a card format
 */
export const RNMapWarningMarkerCard: React.FC<RNMapWarningMarkerCardProps> = ({
  warning,
  onClose,
  style,
  showGetDirectionsButton = false,
}) => {
  const {t} = useTranslation();
  const {language} = useLanguage();
  // Title expansion state
  const [isTitleExpanded, setIsTitleExpanded] = useState(false);
  // Description expansion state
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  // Address expansion state
  const [isAddressExpanded, setIsAddressExpanded] = useState(false);

  const handleGetDirections = () => {
    if (!warning.addresses || warning.addresses.length === 0) {
      return;
    }
    openMapAppsBottomSheet(
      warning.addresses[0].latitude,
      warning.addresses[0].longitude,
      t,
    );
  };

  return (
    <View style={[styles.container, style]}>
      {/* Status Badge - Top Left */}
      <View style={styles.statusBadge}>
        <Icon
          name={getWarningIcon(warning.type) as IconName}
          color={colors.neutral.black}
        />
      </View>

      {/* Close Button */}
      {onClose && (
        <Button
          shape="circle"
          size="small"
          variant="dark"
          iconName="close"
          iconSize={18}
          onPress={onClose}
          style={styles.closeButton}
        />
      )}

      {/* Warning Icon and Title */}
      <View style={styles.headerRow}>
        <TouchableOpacity
          onPress={() => {
            setIsTitleExpanded(prev => !prev);
          }}>
          <Title weight="bold" numberOfLines={isTitleExpanded ? undefined : 1}>
            {EnumUtils.convertWarningType(warning.type)}
          </Title>
        </TouchableOpacity>
      </View>

      {/* Address */}
      {warning.addresses && warning.addresses.length > 0 && (
        <TouchableOpacity
          style={styles.infoRow}
          onPress={() => {
            setIsAddressExpanded(prev => !prev);
          }}>
          <Icon name="map-pin-filled" size={16} />
          <View style={styles.infoTextContainer}>
            <BodySmall numberOfLines={isAddressExpanded ? undefined : 1}>
              {
                warning.addresses.find(
                  address =>
                    address.language.toLowerCase() === language.toLowerCase(),
                )?.address
              }
            </BodySmall>
          </View>
        </TouchableOpacity>
      )}

      {/* Description */}
      {warning.descriptions && warning.descriptions.length > 0 ? (
        <TouchableOpacity
          style={styles.infoRow}
          onPress={() => {
            setIsDescriptionExpanded(prev => !prev);
          }}>
          <Icon name="comment-filled" size={16} />
          <View style={styles.infoTextContainer}>
            <BodySmall numberOfLines={isDescriptionExpanded ? undefined : 1}>
              {
                warning.descriptions.find(
                  description => description.language === Language.TR,
                )?.description
              }
            </BodySmall>
          </View>
        </TouchableOpacity>
      ) : (
        <View style={styles.infoRow}>
          <Icon name="comment-filled" size={16} />
          <View style={styles.infoTextContainer}>
            <BodySmall numberOfLines={isDescriptionExpanded ? undefined : 1}>
              -
            </BodySmall>
          </View>
        </View>
      )}

      {/* Warning Info - Time Since Creation */}
      <View style={styles.warningInfoContainer}>
        <Icon name="clock" size={14} />
        <Caption color={colors.neutral.grey} style={styles.warningInfoText}>
          {formatDistanceToNow(new Date(warning.createdAt), {
            addSuffix: true,
            locale: language.toLowerCase() === 'tr' ? tr : enUS,
          })}
        </Caption>

        {/* Get Directions Button */}
        {warning.addresses &&
          warning.addresses.length > 0 &&
          showGetDirectionsButton && (
            <Button
              title={t('screens.map.get_directions')}
              variant="dark"
              shape="round"
              size="small"
              iconName="location-arrow-filled"
              onPress={handleGetDirections}
            />
          )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: spacing.lg,
    marginHorizontal: spacing.sm,
    ...commonStyles.container,
    borderRadius: radius.lg,
    paddingTop: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    ...getShadow('small'),
    borderLeftWidth: 4,
    borderLeftColor: colors.status.warning,
  },
  statusBadge: {
    position: 'absolute',
    left: spacing.md,
    top: -spacing.lg,
    backgroundColor: colors.status.warning,
    padding: spacing.sm,
    borderRadius: radius.round,
    zIndex: 10,
  },
  closeButton: {
    position: 'absolute',
    right: spacing.sm,
    top: spacing.sm,
    ...getShadow('small'),
    zIndex: 10,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
    gap: spacing.xs,
  },
  infoTextContainer: {
    flex: 1,
  },
  warningInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.secondary.main,
  },
  warningInfoText: {
    flex: 1,
  },
});
