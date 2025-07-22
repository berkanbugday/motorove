import { GroupPrivacy, GroupTag } from "../../enums";

/**
 * Create Group Interface
 * Used for creating new groups
 */
export interface ICreateGroup {
  /**
   * Group name
   */
  name: string;

  /**
   * Group description
   */
  description: string;

  /**
   * Optional logo URL
   */
  logo: string;

  /**
   * Optional cover image URL
   */
  cover?: string | null;

  /**
   * City ID
   */
  cityId: string;

  /**
   * Group privacy setting
   */
  privacy: GroupPrivacy;

  /**
   * Optional members capacity limit
   */
  membersCapacity?: number | null;

  /**
   * Optional tag IDs to associate with the group
   */
  tags: GroupTag[];
}
