import React, {useState, useEffect} from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import {IEmergency, Language} from '@motorove/shared';
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
import {getEmergencyIcon} from '@utils/emergencyUtils';
import {useLanguage} from '@contexts/LanguageContext';
import {formatDistanceToNow} from 'date-fns';
import {tr, enUS} from 'date-fns/locale';
import {calculateRoute} from '@utils/locationUtils';

/**
 * Emergency marker card props
 */
export interface RNMapEmergencyMarkerCardProps {
  emergency: IEmergency;
  onPress?: () => void;
  onClose?: () => void;
  style?: StyleProp<ViewStyle>;
  userLocation?: {
    latitude: number;
    longitude: number;
  };
  onProfilePress?: (userId: string) => void;
}

/**
 * Emergency marker card component
 * Displays detailed emergency information in a card format
 */
export const RNMapEmergencyMarkerCard: React.FC<
  RNMapEmergencyMarkerCardProps
> = ({emergency, onClose, style, userLocation, onProfilePress}) => {
  const {t} = useTranslation();
  const {language} = useLanguage();
  // Title expansion state
  const [isTitleExpanded, setIsTitleExpanded] = useState(false);
  // Description expansion state
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  // Address expansion state
  const [isAddressExpanded, setIsAddressExpanded] = useState(false);
  // Distance state
  const [distance, setDistance] = useState<string | null>(null);

  // Calculate route distance
  useEffect(() => {
    if (
      !userLocation ||
      !emergency.addresses ||
      emergency.addresses.length === 0
    ) {
      setDistance(null);
      return;
    }

    const fetchRouteDistance = async () => {
      try {
        const route = await calculateRoute(
          userLocation.latitude,
          userLocation.longitude,
          emergency.addresses[0].latitude,
          emergency.addresses[0].longitude,
          language as Language,
        );
        setDistance(route.distanceKm.toString());
      } catch (error) {
        console.error('Error calculating route distance:', error);
        setDistance(null);
      }
    };

    fetchRouteDistance();
  }, [userLocation, emergency.addresses, language]);

  const handleGetDirections = () => {
    if (!emergency.addresses || emergency.addresses.length === 0) {
      return;
    }
    openMapAppsBottomSheet(
      emergency.addresses[0].latitude,
      emergency.addresses[0].longitude,
      t,
    );
  };

  return (
    <View style={[styles.container, style]}>
      {/* Status Badge - Top Left */}
      <View style={styles.statusBadge}>
        <Icon
          name={getEmergencyIcon(emergency.type) as IconName}
          color={colors.neutral.white}
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

      {/* Emergency Icon and Title */}
      <View style={styles.headerRow}>
        <TouchableOpacity
          onPress={() => {
            setIsTitleExpanded(prev => !prev);
          }}>
          <Title weight="bold" numberOfLines={isTitleExpanded ? undefined : 1}>
            {EnumUtils.convertEmergencyType(emergency.type)}
          </Title>
        </TouchableOpacity>
      </View>

      {/* Address with Distance */}
      {emergency.addresses && emergency.addresses.length > 0 && (
        <TouchableOpacity
          style={styles.infoRow}
          onPress={() => {
            setIsAddressExpanded(prev => !prev);
          }}>
          <Icon name="map-pin-filled" size={16} />
          <View style={styles.infoTextContainer}>
            <BodySmall numberOfLines={isAddressExpanded ? undefined : 1}>
              {
                emergency.addresses.find(
                  address =>
                    address.language.toLowerCase() === language.toLowerCase(),
                )?.address
              }
            </BodySmall>
            {distance && (
              <Caption color={colors.neutral.grey}>
                {distance} {t('screens.map.km_away')}
              </Caption>
            )}
          </View>
        </TouchableOpacity>
      )}

      {/* Description */}
      {emergency.descriptions && emergency.descriptions.length > 0 ? (
        <TouchableOpacity
          style={styles.infoRow}
          onPress={() => {
            setIsDescriptionExpanded(prev => !prev);
          }}>
          <Icon name="comment-filled" size={16} />
          <View style={styles.infoTextContainer}>
            <BodySmall numberOfLines={isDescriptionExpanded ? undefined : 1}>
              {
                emergency.descriptions.find(
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

      {/* Created By */}
      {emergency.createdBy && (
        <TouchableOpacity
          style={styles.infoRow}
          onPress={() => {
            if (onProfilePress && emergency.createdBy?.id) {
              onProfilePress(emergency.createdBy.id);
            }
          }}
          disabled={!onProfilePress || !emergency.createdBy?.id}>
          <Icon name="user-filled" size={16} />
          <View style={styles.infoTextContainer}>
            <BodySmall>
              {emergency.createdBy.firstName} {emergency.createdBy.lastName}
            </BodySmall>
          </View>
        </TouchableOpacity>
      )}

      {/* Emergency Info - Time Since Creation */}
      <View style={styles.emergencyInfoContainer}>
        <Icon name="clock" size={14} />
        <Caption color={colors.neutral.grey} style={styles.emergencyInfoText}>
          {formatDistanceToNow(new Date(emergency.createdAt), {
            addSuffix: true,
            locale: language.toLowerCase() === 'tr' ? tr : enUS,
          })}
        </Caption>
        {/* Get Directions Button */}
        {emergency.addresses && emergency.addresses.length > 0 && (
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
    borderLeftColor: colors.status.error,
  },
  statusBadge: {
    position: 'absolute',
    left: spacing.md,
    top: -spacing.lg,
    backgroundColor: colors.status.error,
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
    marginRight: spacing.xl,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  infoTextContainer: {
    flex: 1,
  },
  emergencyInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.secondary.main,
  },
  emergencyInfoText: {
    flex: 1,
    marginRight: spacing.sm,
  },
});
