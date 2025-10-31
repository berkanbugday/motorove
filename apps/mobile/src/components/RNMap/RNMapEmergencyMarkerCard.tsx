import React, {useState, useEffect} from 'react';
import {View, StyleSheet, TouchableOpacity} from 'react-native';
import {IEmergency} from '@motorove/shared';
import {StyleProp, ViewStyle} from 'react-native';
import {colors, spacing, radius, getShadow, commonStyles} from '@theme';
import {Title, Caption, Icon, Button, BodySmall, Chip} from '@components';
import {useTranslation} from '@hooks/useTranslation';
import {EnumUtils} from '@utils/enumUtils';
import {calculateDistance} from '@utils/locationUtils';

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
  onHelpPress?: () => void;
}

/**
 * Emergency marker card component
 * Displays detailed emergency information in a card format
 */
export const RNMapEmergencyMarkerCard: React.FC<
  RNMapEmergencyMarkerCardProps
> = ({emergency, onClose, style, userLocation, onHelpPress}) => {
  const {t} = useTranslation();
  // Description expansion state
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  // Address expansion state
  const [isAddressExpanded, setIsAddressExpanded] = useState(false);
  // Distance state
  const [distance, setDistance] = useState<string | null>(null);

  // Calculate straight-line distance
  useEffect(() => {
    if (!userLocation) {
      setDistance(null);
      return;
    }

    const straightLineDistance = calculateDistance(userLocation, {
      latitude: emergency.latitude,
      longitude: emergency.longitude,
    });
    setDistance(straightLineDistance.toFixed(1));
  }, [userLocation, emergency.latitude, emergency.longitude]);

  return (
    <View style={[styles.container, style]}>
      {/* Emergency Type Badge - Top Left */}
      <View style={styles.statusBadge}>
        <Chip
          label={EnumUtils.convertEmergencyType(emergency.type)}
          variant="filled"
          color="error"
          size="small"
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
        <Icon name="siren-on-filled" size={24} color={colors.status.error} />
        <Title weight="bold" style={styles.emergencyTitle}>
          {emergency.title}
        </Title>
      </View>

      {/* Emergency Type */}
      <View style={styles.typeRow}>
        <BodySmall weight="semiBold" color={colors.status.error}>
          {EnumUtils.convertEmergencyType(emergency.type)}
        </BodySmall>
      </View>

      {/* Address with Distance */}
      {emergency.address && (
        <TouchableOpacity
          style={styles.infoRow}
          onPress={() => {
            setIsAddressExpanded(prev => !prev);
          }}>
          <Icon name="map-pin-filled" size={16} color={colors.status.error} />
          <View style={styles.infoTextContainer}>
            <BodySmall numberOfLines={isAddressExpanded ? undefined : 1}>
              {emergency.address}
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
      {emergency.description && (
        <TouchableOpacity
          style={styles.infoRow}
          onPress={() => {
            setIsDescriptionExpanded(prev => !prev);
          }}>
          <Icon name="file-filled" size={16} color={colors.status.error} />
          <View style={styles.infoTextContainer}>
            <BodySmall numberOfLines={isDescriptionExpanded ? undefined : 2}>
              {emergency.description}
            </BodySmall>
          </View>
        </TouchableOpacity>
      )}

      {/* Help Button */}
      {onHelpPress && (
        <Button
          title={t('screens.map.offer_help')}
          variant="primary"
          shape="round"
          size="medium"
          iconName="user-plus-filled"
          iconPosition="left"
          style={styles.helpButton}
          onPress={onHelpPress}
        />
      )}

      {/* Emergency Info */}
      <View style={styles.emergencyInfoContainer}>
        <Icon name="bell-exclamation-filled" size={14} color={colors.status.error} />
        <Caption color={colors.neutral.grey} style={styles.emergencyInfoText}>
          {t('screens.map.emergency_info')}
        </Caption>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: spacing.sm,
    marginHorizontal: spacing.sm,
    ...commonStyles.container,
    borderRadius: radius.lg,
    paddingTop: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    ...getShadow('medium'),
    borderLeftWidth: 4,
    borderLeftColor: colors.status.error,
  },
  closeButton: {
    position: 'absolute',
    right: spacing.sm,
    top: spacing.sm,
    ...getShadow('small'),
    zIndex: 10,
  },
  statusBadge: {
    position: 'absolute',
    left: spacing.md,
    top: -spacing.sm,
    zIndex: 10,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  emergencyTitle: {
    flex: 1,
    color: colors.status.error,
  },
  typeRow: {
    marginBottom: spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  infoTextContainer: {
    flex: 1,
  },
  helpButton: {
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
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
  },
});
