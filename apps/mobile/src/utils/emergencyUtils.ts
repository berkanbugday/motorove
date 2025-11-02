import {IconName} from '@components/Icon';
import {EmergencyType} from '@motorove/shared';
import {colors} from '@theme/colors';

/**
 * Emergency type configuration with icon mapping and colors
 */
export interface EmergencyTypeConfig {
  type: EmergencyType;
  icon: string;
  iconColor: string;
  pinColor: string;
}

/**
 * Get icon name for an emergency type
 * @param type Emergency type
 * @returns Icon name
 */
export const getEmergencyIcon = (type: EmergencyType): IconName => {
  const emergencyConfig = EMERGENCY_TYPE_CONFIGS.find(
    config => config.type === type,
  );
  return emergencyConfig?.icon as IconName;
};

/**
 * Get icon color for an emergency type
 * @param type Emergency type
 * @returns Icon color
 */
export const getEmergencyIconColor = (type: EmergencyType): string => {
  const emergencyConfig = EMERGENCY_TYPE_CONFIGS.find(
    config => config.type === type,
  );
  return emergencyConfig?.iconColor || colors.neutral.white;
};

/**
 * Get pin color for an emergency type
 * @param type Emergency type
 * @returns Pin color
 */
export const getEmergencyPinColor = (type: EmergencyType): string => {
  const emergencyConfig = EMERGENCY_TYPE_CONFIGS.find(
    config => config.type === type,
  );
  return emergencyConfig?.pinColor || colors.status.error;
};

/**
 * Get icon name, icon color, and pin color for an emergency type
 * @param type Emergency type
 * @returns Object containing iconName, iconColor, and pinColor
 */
export const getEmergencyIconAndColor = (
  type: EmergencyType,
): {iconName: IconName; iconColor: string; pinColor: string} => {
  const emergencyConfig = EMERGENCY_TYPE_CONFIGS.find(
    config => config.type === type,
  );
  return {
    iconName: (emergencyConfig?.icon || 'bell-exclamation-filled') as IconName,
    iconColor: emergencyConfig?.iconColor || colors.neutral.white,
    pinColor: emergencyConfig?.pinColor || colors.status.error,
  };
};

/**
 * Emergency type configurations with icons and colors
 */
export const EMERGENCY_TYPE_CONFIGS: EmergencyTypeConfig[] = [
  {
    type: EmergencyType.ACCIDENT,
    icon: 'car-crash-filled',
    iconColor: colors.neutral.white,
    pinColor: colors.status.error,
  },
  {
    type: EmergencyType.BREAKDOWN,
    icon: 'screwdriver-filled',
    iconColor: colors.neutral.white,
    pinColor: colors.status.error,
  },
  {
    type: EmergencyType.MEDICAL,
    icon: 'stethoscope-filled',
    iconColor: colors.neutral.white,
    pinColor: colors.status.error,
  },
  {
    type: EmergencyType.FUEL_SHORTAGE,
    icon: 'gas-pump-filled',
    iconColor: colors.neutral.white,
    pinColor: colors.status.error,
  },
  {
    type: EmergencyType.TIRE_PROBLEM,
    icon: 'tire-filled',
    iconColor: colors.neutral.white,
    pinColor: colors.status.error,
  },
  {
    type: EmergencyType.BATTERY_DEAD,
    icon: 'car-battery-filled',
    iconColor: colors.neutral.white,
    pinColor: colors.status.error,
  },
  {
    type: EmergencyType.LOST,
    icon: 'location-question-filled',
    iconColor: colors.neutral.white,
    pinColor: colors.status.error,
  },
  {
    type: EmergencyType.OTHER,
    icon: 'bell-exclamation-filled',
    iconColor: colors.neutral.white,
    pinColor: colors.status.error,
  },
];
