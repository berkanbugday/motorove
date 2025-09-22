import React, {useCallback} from 'react';
import {StyleSheet, View, TouchableOpacity, Image} from 'react-native';
import {Typography, Icon, Chip} from '@components';
import {colors, radius, spacing} from '@theme';
import {EquipmentCardProps} from '../types';
import {formatDistanceToNow} from 'date-fns';
import {tr, enUS} from 'date-fns/locale';
import {useLanguage} from '@contexts/LanguageContext';
import {Language, EquipmentType} from '@motorove/shared';

export const EquipmentCard: React.FC<EquipmentCardProps> = ({
  equipment,
  onPress,
}) => {
  const {language} = useLanguage();

  const formatTimeAgo = useCallback(
    (dateString: string) => {
      return formatDistanceToNow(new Date(dateString), {
        addSuffix: true,
        locale:
          language.toLowerCase() === Language.TR.toLowerCase() ? tr : enUS,
      });
    },
    [language],
  );

  const getEquipmentTypeLabel = useCallback((type: EquipmentType) => {
    // Convert enum to readable label
    return type
      .toLowerCase()
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }, []);

  const getEquipmentTypeIcon = useCallback((type: EquipmentType) => {
    switch (type) {
      case EquipmentType.FULL_FACE_HELMET:
      case EquipmentType.MODULAR_HELMET:
      case EquipmentType.OPEN_FACE_HELMET:
      case EquipmentType.OFF_ROAD_HELMET:
      case EquipmentType.HALF_HELMET:
        return 'camera'; //shield
      case EquipmentType.RIDING_JACKET:
      case EquipmentType.ARMOR:
      case EquipmentType.BACK_PROTECTOR:
      case EquipmentType.AIRBAG_VEST:
      case EquipmentType.RIDING_PANTS:
        return 'camera'; //shield-check
      case EquipmentType.GLOVES:
        return 'camera'; //hand
      case EquipmentType.BOOTS:
        return 'camera'; //shoe-print
      case EquipmentType.CAMERA:
        return 'camera'; //camera
      case EquipmentType.GPS_DEVICE:
        return 'camera'; //map
      case EquipmentType.INTERCOM:
        return 'camera'; //headphones
      case EquipmentType.FIRST_AID_KIT:
        return 'camera'; //medical-bag
      default:
        return 'camera'; //cog
    }
  }, []);

  const getEquipmentTypeColor = useCallback((type: EquipmentType) => {
    // Helmets - Red (Safety critical)
    if (
      [
        EquipmentType.FULL_FACE_HELMET,
        EquipmentType.MODULAR_HELMET,
        EquipmentType.OPEN_FACE_HELMET,
        EquipmentType.OFF_ROAD_HELMET,
        EquipmentType.HALF_HELMET,
      ].includes(type)
    ) {
      return colors.status.error;
    }

    // Protection gear - Orange (Safety important)
    if (
      [
        EquipmentType.RIDING_JACKET,
        EquipmentType.ARMOR,
        EquipmentType.BACK_PROTECTOR,
        EquipmentType.AIRBAG_VEST,
        EquipmentType.RIDING_PANTS,
        EquipmentType.KNEE_GUARDS,
        EquipmentType.GLOVES,
        EquipmentType.BOOTS,
      ].includes(type)
    ) {
      return colors.status.warning;
    }

    // Electronics - Blue (Tech)
    if (
      [
        EquipmentType.CAMERA,
        EquipmentType.GPS_DEVICE,
        EquipmentType.INTERCOM,
      ].includes(type)
    ) {
      return colors.primary.main;
    }

    // Other - Gray (General)
    return colors.neutral.grey;
  }, []);

  const renderImage = () => {
    if (equipment.images && equipment.images.length > 0) {
      return (
        <Image
          source={{uri: equipment.images[0]}}
          style={styles.image}
          resizeMode="cover"
        />
      );
    }

    return (
      <View style={styles.placeholderImage}>
        <Icon
          name={getEquipmentTypeIcon(equipment.type)}
          size={40}
          color={colors.neutral.grey}
        />
      </View>
    );
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}>
      <View style={styles.content}>
        {/* Image Section */}
        <View style={styles.imageContainer}>{renderImage()}</View>

        {/* Content Section */}
        <View style={styles.infoContainer}>
          <View style={styles.headerRow}>
            <View style={styles.titleContainer}>
              <Typography
                variant="subtitle"
                weight="bold"
                color={colors.neutral.black}
                numberOfLines={1}>
                {equipment.name}
              </Typography>
              <View style={styles.brandRow}>
                <Typography
                  variant="body"
                  color={colors.neutral.grey}
                  style={styles.brand}>
                  {equipment.brand}
                </Typography>
                {equipment.year && (
                  <Typography
                    variant="body"
                    color={colors.neutral.grey}
                    style={styles.year}>
                    • {equipment.year}
                  </Typography>
                )}
              </View>
            </View>
          </View>

          <View style={styles.typeContainer}>
            <Chip
              label={getEquipmentTypeLabel(equipment.type)}
              variant="filled"
              size="small"
              leadingIcon={getEquipmentTypeIcon(equipment.type)}
              style={[
                styles.typeChip,
                {backgroundColor: getEquipmentTypeColor(equipment.type)},
              ]}
              labelStyle={styles.typeChipLabel}
            />
          </View>

          {equipment.description && (
            <Typography
              variant="body"
              color={colors.neutral.darkGrey}
              numberOfLines={2}
              style={styles.description}>
              {equipment.description}
            </Typography>
          )}

          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Icon
                name="clock"
                size={14}
                color={colors.neutral.grey}
                style={styles.metaIcon}
              />
              <Typography variant="caption" color={colors.neutral.grey}>
                {formatTimeAgo(equipment.updatedAt)}
              </Typography>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.neutral.white,
    borderRadius: radius.md,
    marginBottom: spacing.md,
    shadowColor: colors.neutral.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  content: {
    padding: spacing.md,
  },
  imageContainer: {
    position: 'relative',
    marginBottom: spacing.sm,
  },
  image: {
    width: '100%',
    height: 160,
    borderRadius: radius.sm,
  },
  placeholderImage: {
    width: '100%',
    height: 160,
    backgroundColor: colors.secondary.light,
    borderRadius: radius.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageCountBadge: {
    position: 'absolute',
    top: spacing.xs,
    right: spacing.xs,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: radius.sm,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
  },
  infoContainer: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.xs,
  },
  titleContainer: {
    flex: 1,
    marginRight: spacing.sm,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  brand: {
    marginRight: spacing.xs,
  },
  year: {
    marginLeft: spacing.xs,
  },
  menuButton: {
    padding: spacing.xs,
  },
  typeContainer: {
    marginBottom: spacing.sm,
  },
  typeChip: {
    alignSelf: 'flex-start',
  },
  typeChipLabel: {
    color: colors.neutral.white,
    fontSize: 12,
  },
  description: {
    marginBottom: spacing.sm,
    lineHeight: 20,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaIcon: {
    marginRight: spacing.xs,
  },
});
