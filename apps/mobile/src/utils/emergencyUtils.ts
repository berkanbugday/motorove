import {EmergencyType} from '@motorove/shared';

/**
 * Emergency type configuration with icon mapping
 */
export interface EmergencyTypeConfig {
  type: EmergencyType;
  icon: string;
}

/**
 * Get icon name for an emergency type
 * @param type Emergency type
 * @returns Icon name
 */
export const getEmergencyIcon = (type: EmergencyType): string => {
  const emergencyConfig = EMERGENCY_TYPE_CONFIGS.find(
    config => config.type === type,
  );
  return emergencyConfig?.icon || 'help-circle';
};

/**
 * Emergency type configurations with icons
 */
export const EMERGENCY_TYPE_CONFIGS: EmergencyTypeConfig[] = [
  {type: EmergencyType.ACCIDENT, icon: 'alert-triangle'},
  {type: EmergencyType.BREAKDOWN, icon: 'wrench'},
  {type: EmergencyType.MEDICAL, icon: 'heart'},
  {type: EmergencyType.FUEL_SHORTAGE, icon: 'fuel'},
  {type: EmergencyType.TIRE_PROBLEM, icon: 'circle'},
  {type: EmergencyType.BATTERY_DEAD, icon: 'battery'},
  {type: EmergencyType.LOST, icon: 'map-pin'},
  {type: EmergencyType.OTHER, icon: 'help-circle'},
];
