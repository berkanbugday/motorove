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
  ApprovalStatus,
  Language,
  NotificationType,
  RidingStyle,
  RoadType,
  EquipmentType,
  SocialMediaPlatform,
  SupportCategory,
  Currency,
} from '@motorove/shared';
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

  static convertGroupPrivacy(privacy: GroupPrivacy): string {
    const privacyItem = this.getGroupPrivacyOptions().find(
      t => t.value.toLowerCase() === privacy.toLowerCase(),
    );
    return privacyItem?.label || privacy;
  }

  static convertEventType(eventType: EventType): string {
    const eventTypeItem = this.getEventTypes().find(
      t => t.value.toLowerCase() === eventType.toLowerCase(),
    );
    return eventTypeItem?.label || eventType;
  }

  static convertRoadType(roadType: RoadType): string {
    const roadTypeItem = this.getRoadTypes().find(
      t => t.value.toLowerCase() === roadType.toLowerCase(),
    );
    return roadTypeItem?.label || roadType;
  }

  static convertExperienceLevel(experienceLevel: ExperienceLevel): string {
    const experienceLevelItem = this.getExperienceLevels().find(
      t => t.value.toLowerCase() === experienceLevel.toLowerCase(),
    );
    return experienceLevelItem?.label || experienceLevel;
  }

  static convertDifficultyLevel(difficultyLevel: DifficultyLevel): string {
    const difficultyLevelItem = this.getDifficultyLevels().find(
      t => t.value.toLowerCase() === difficultyLevel.toLowerCase(),
    );
    return difficultyLevelItem?.label || difficultyLevel;
  }

  static getGroupMemberRoles(): DropdownItem[] {
    return this.getDropdownOptions(GroupMemberRole, 'enums.groupMemberRole');
  }

  static getApprovalStatuses(): DropdownItem[] {
    return this.getDropdownOptions(ApprovalStatus, 'enums.approvalStatus');
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

  static getInterestDropdownOptions(): DropdownItem[] {
    return this.getDropdownOptions(Interest, 'enums.interest');
  }

  static getEventParticipantStatuses(): DropdownItem[] {
    return this.getDropdownOptions(
      EventParticipantStatus,
      'enums.eventParticipantStatus',
    );
  }

  static getNotificationTypes(): DropdownItem[] {
    return this.getDropdownOptions(NotificationType, 'enums.notificationType');
  }

  static convertNotificationType(notificationType: NotificationType): string {
    const notificationTypeItem = this.getNotificationTypes().find(
      t => t.value.toLowerCase() === notificationType.toLowerCase(),
    );
    return notificationTypeItem?.label || notificationType;
  }

  static getGroupTags(): DropdownItem[] {
    return this.getDropdownOptions(GroupTag, 'enums.groupTag');
  }

  static convertGroupTags(tags: GroupTag[]): string[] {
    let convertedTags: string[] = [];
    tags.map(tag => {
      const tagItem = this.getGroupTags().find(
        t => t.value.toLowerCase() === tag.toLowerCase(),
      );
      if (tagItem) {
        convertedTags.push(tagItem.label);
      }
    });
    return convertedTags;
  }

  static getGenderDropdownOptions(): DropdownItem[] {
    return this.getDropdownOptions(Gender, 'enums.gender');
  }

  static getSupportCategories(): DropdownItem[] {
    return this.getDropdownOptions(SupportCategory, 'enums.supportCategory');
  }
  static getCurrencyDropdownOptions(): DropdownItem[] {
    return this.getDropdownOptions(Currency, 'enums.currency');
  }
}
