import {WarningType} from '@motorove/shared';

/**
 * Warning type configuration with icon mapping
 */
export interface WarningTypeConfig {
  type: WarningType;
  icon: string;
}

/**
 * Get icon name for a warning type
 * @param type Warning type
 * @returns Icon name
 */
export const getWarningIcon = (type: WarningType): string => {
  const warningConfig = WARNING_TYPE_CONFIGS.find(config => config.type === type);
  return warningConfig?.icon || 'error-filled';
};

/**
 * Warning type configurations with icons
 */
export const WARNING_TYPE_CONFIGS: WarningTypeConfig[] = [
  {type: WarningType.RADAR, icon: 'radar-filled'},
  {type: WarningType.POLICE_CHECKPOINT, icon: 'siren-on-filled'},
  {type: WarningType.ACCIDENT, icon: 'car-crash-filled'},
  {type: WarningType.ROAD_CONSTRUCTION, icon: 'person-digging-filled'},
  {type: WarningType.ROAD_CLOSURE, icon: 'do-not-enter-filled'},
  {type: WarningType.DANGEROUS_CURVE, icon: 'scribble-filled'},
  {type: WarningType.SLIPPERY_ROAD, icon: 'road-filled'},
  {type: WarningType.PARKING_PROHIBITED, icon: 'ban-parking-filled'},
  {type: WarningType.OTHER, icon: 'error-filled'},
];
