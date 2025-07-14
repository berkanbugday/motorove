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
import {toPascalCase} from '@utils/stringUtils';
import {DropdownItem} from '@components/Dropdown/types';
import {i18n} from '@/i18n';

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
   * Get enum values as options with translated labels
   * @param enumObject - The enum to convert
   * @param translationNamespace - The i18n namespace where translations are found (e.g., 'equipment')
   * @param fallbackFormatter - Optional function to format value if translation is not found
   * @returns Array of dropdown items with translated labels
   */
  static getDropdownOptions(
    enumObject: Record<string, string>,
    translationNamespace: string,
  ): DropdownItem[] {
    return Object.entries(enumObject).map(([key, value]) => {
      // Try to get translation for this enum value
      const translationKey = value.toLowerCase();
      const label = i18n.t(`${translationNamespace}.${translationKey}`);

      return {
        id: key,
        label,
        value: value,
      };
    });
  }

  // Specific enum getters
  static getGroupPrivacyOptions(): DropdownItem[] {
    return this.getDropdownOptions(GroupPrivacy, 'enums.groupPrivacy');
  }

  static getGroupMemberRoles(): DropdownItem[] {
    return this.getDropdownOptions(GroupMemberRole, 'enums.groupMemberRole');
  }

  static getInvitationStatuses(): DropdownItem[] {
    return this.getDropdownOptions(InvitationStatus, 'enums.invitationStatus');
  }

  static getEventTypes(): DropdownItem[] {
    return this.getDropdownOptions(EventType, 'enums.eventType');
  }

  static getRoadTypes(): DropdownItem[] {
    return this.getDropdownOptions(RoadType, 'enums.roadType');
  }

  static getDifficultyLevels(): DropdownItem[] {
    return this.getDropdownOptions(DifficultyLevel, 'enums.difficultyLevel');
  }

  static getExperienceLevels(): DropdownItem[] {
    return this.getDropdownOptions(ExperienceLevel, 'enums.experienceLevel');
  }

  static getAddressTypes(): DropdownItem[] {
    return this.getDropdownOptions(AddressType, 'enums.addressType');
  }

  static getLanguages(): DropdownItem[] {
    return this.getDropdownOptions(Language, 'enums.language');
  }

  static getGenders(): DropdownItem[] {
    return this.getDropdownOptions(Gender, 'enums.gender');
  }

  static getRidingStyleDropdownOptions(): DropdownItem[] {
    return this.getDropdownOptions(RidingStyle, 'enums.ridingStyle');
  }

  static getEquipmentTypes(): DropdownItem[] {
    return this.getDropdownOptions(EquipmentType, 'enums.equipmentType');
  }

  static getSocialMediaPlatforms(): DropdownItem[] {
    return this.getDropdownOptions(
      SocialMediaPlatform,
      'enums.socialMediaPlatform',
    );
  }

  static getInterests(): DropdownItem[] {
    return this.getDropdownOptions(Interest, 'enums.interest');
  }

  static getEventParticipantStatuses(): DropdownItem[] {
    return this.getDropdownOptions(
      EventParticipantStatus,
      'enums.eventParticipantStatus',
    );
  }

  static getNotificationStatuses(): DropdownItem[] {
    return this.getDropdownOptions(
      NotificationStatus,
      'enums.notificationStatus',
    );
  }

  static getNotificationTypes(): DropdownItem[] {
    return this.getDropdownOptions(NotificationType, 'enums.notificationType');
  }

  static getGroupTags(): DropdownItem[] {
    return this.getDropdownOptions(GroupTag, 'enums.groupTag');
  }

  static getGenderDropdownOptions(): DropdownItem[] {
    return this.getDropdownOptions(Gender, 'enums.gender');
  }
}
