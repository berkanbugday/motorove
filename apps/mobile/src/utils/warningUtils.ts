import {IconName} from '@components/Icon';
import {WarningType} from '@motorove/shared';
import {colors} from '@theme/colors';

/**
 * Warning type configuration with icon mapping and colors
 */
export interface WarningTypeConfig {
  type: WarningType;
  icon: string;
  iconColor: string;
  pinColor: string;
}

/**
 * Get icon name for a warning type
 * @param type Warning type
 * @returns Icon name
 */
export const getWarningIcon = (type: WarningType): IconName => {
  const warningConfig = WARNING_TYPE_CONFIGS.find(
    config => config.type === type,
  );
  return warningConfig?.icon as IconName;
};

/**
 * Get icon color for a warning type
 * @param type Warning type
 * @returns Icon color
 */
export const getWarningIconColor = (type: WarningType): string => {
  const warningConfig = WARNING_TYPE_CONFIGS.find(
    config => config.type === type,
  );
  return warningConfig?.iconColor || colors.neutral.black;
};

/**
 * Get pin color for a warning type
 * @param type Warning type
 * @returns Pin color
 */
export const getWarningPinColor = (type: WarningType): string => {
  const warningConfig = WARNING_TYPE_CONFIGS.find(
    config => config.type === type,
  );
  return warningConfig?.pinColor || colors.status.warning;
};

/**
 * Get icon name, icon color, and pin color for a warning type
 * @param type Warning type
 * @returns Object containing iconName, iconColor, and pinColor
 */
export const getWarningIconAndColor = (
  type: WarningType,
): {iconName: IconName; iconColor: string; pinColor: string} => {
  const warningConfig = WARNING_TYPE_CONFIGS.find(
    config => config.type === type,
  );
  return {
    iconName: (warningConfig?.icon || 'error-filled') as IconName,
    iconColor: warningConfig?.iconColor || colors.neutral.black,
    pinColor: warningConfig?.pinColor || colors.status.warning,
  };
};

/**
 * Warning type configurations with icons and colors
 */
export const WARNING_TYPE_CONFIGS: WarningTypeConfig[] = [
  {
    type: WarningType.RADAR,
    icon: 'radar-filled',
    iconColor: colors.neutral.black,
    pinColor: colors.status.warning,
  },
  {
    type: WarningType.POLICE_CHECKPOINT,
    icon: 'siren-on-filled',
    iconColor: colors.neutral.black,
    pinColor: colors.status.warning,
  },
  {
    type: WarningType.ACCIDENT,
    icon: 'car-crash-filled',
    iconColor: colors.neutral.black,
    pinColor: colors.status.warning,
  },
  {
    type: WarningType.ROAD_CONSTRUCTION,
    icon: 'person-digging-filled',
    iconColor: colors.neutral.black,
    pinColor: colors.status.warning,
  },
  {
    type: WarningType.ROAD_CLOSURE,
    icon: 'do-not-enter-filled',
    iconColor: colors.neutral.black,
    pinColor: colors.status.warning,
  },
  {
    type: WarningType.DANGEROUS_CURVE,
    icon: 'scribble-filled',
    iconColor: colors.neutral.black,
    pinColor: colors.status.warning,
  },
  {
    type: WarningType.SLIPPERY_ROAD,
    icon: 'road-filled',
    iconColor: colors.neutral.black,
    pinColor: colors.status.warning,
  },
  {
    type: WarningType.PARKING_PROHIBITED,
    icon: 'ban-parking-filled',
    iconColor: colors.neutral.black,
    pinColor: colors.status.warning,
  },
  {
    type: WarningType.OTHER,
    icon: 'error-filled',
    iconColor: colors.neutral.black,
    pinColor: colors.status.warning,
  },
];
