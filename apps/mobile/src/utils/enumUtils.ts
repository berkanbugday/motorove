import {
  AddressType,
  DifficultyLevel,
  EventParticipantStatus,
  EventType,
  ExperienceLevel,
  Gender,
  GroupMemberRole,
  GroupPrivacy,
  GroupTag,
  Interest,
  InvitationStatus,
  Language,
  NotificationStatus,
  NotificationType,
  RidingStyle,
  RoadType,
  EquipmentType,
  SocialMediaPlatform,
} from '@motorove/shared';

/**
 * EnumItem represents a single enum value with a key and display value
 */
export interface EnumItem {
  key: string;
  value: string;
  label?: string; // For UI display, can be different from value
}

/**
 * EnumUtils provides utility methods to work with enums from the shared package
 * It converts TypeScript enums to formats suitable for UI components
 */
export class EnumUtils {
  /**
   * Convert any enum to an array of EnumItem objects
   * @param enumObject - The enum to convert
   * @returns Array of EnumItem objects
   */
  static enumToArray(enumObject: Record<string, string>): EnumItem[] {
    return Object.entries(enumObject).map(([key, value]) => ({
      key,
      value,
    }));
  }

  /**
   * Convert any enum to an array of EnumItem objects with custom labels
   * @param enumObject - The enum to convert
   * @param labelMap - Map of enum values to display labels
   * @returns Array of EnumItem objects with labels
   */
  static enumToArrayWithLabels(
    enumObject: Record<string, string>,
    labelMap: Record<string, string>,
  ): EnumItem[] {
    return Object.entries(enumObject).map(([key, value]) => ({
      key,
      value,
      label: labelMap[value] || value,
    }));
  }

  /**
   * Get enum values as options suitable for dropdowns, pickers, etc.
   * @returns Array of { label: string, value: string } objects
   */
  static getDropdownOptions(
    enumObject: Record<string, string>,
    labelMap?: Record<string, string>,
  ): {label: string; value: string}[] {
    return Object.entries(enumObject).map(([_, value]) => ({
      label: labelMap?.[value] || value,
      value,
    }));
  }

  // Specific enum getters
  static getGroupPrivacyOptions(): EnumItem[] {
    return this.enumToArray(GroupPrivacy);
  }

  static getGroupMemberRoles(): EnumItem[] {
    return this.enumToArray(GroupMemberRole);
  }

  static getInvitationStatuses(): EnumItem[] {
    return this.enumToArray(InvitationStatus);
  }

  static getEventTypes(): EnumItem[] {
    return this.enumToArray(EventType);
  }

  static getRoadTypes(): EnumItem[] {
    return this.enumToArray(RoadType);
  }

  static getDifficultyLevels(): EnumItem[] {
    return this.enumToArray(DifficultyLevel);
  }

  static getExperienceLevels(): EnumItem[] {
    return this.enumToArray(ExperienceLevel);
  }

  static getAddressTypes(): EnumItem[] {
    return this.enumToArray(AddressType);
  }

  static getLanguages(): EnumItem[] {
    return this.enumToArray(Language);
  }

  static getGenders(): EnumItem[] {
    return this.enumToArray(Gender);
  }

  static getRidingStyles(): EnumItem[] {
    return this.enumToArray(RidingStyle);
  }

  static getEquipmentTypes(): EnumItem[] {
    return this.enumToArray(EquipmentType);
  }

  static getSocialMediaPlatforms(): EnumItem[] {
    return this.enumToArray(SocialMediaPlatform);
  }

  static getInterests(): EnumItem[] {
    return this.enumToArray(Interest);
  }

  static getEventParticipantStatuses(): EnumItem[] {
    return this.enumToArray(EventParticipantStatus);
  }

  static getNotificationStatuses(): EnumItem[] {
    return this.enumToArray(NotificationStatus);
  }

  static getNotificationTypes(): EnumItem[] {
    return this.enumToArray(NotificationType);
  }

  static getGroupTags(): EnumItem[] {
    return this.enumToArray(GroupTag);
  }
}
