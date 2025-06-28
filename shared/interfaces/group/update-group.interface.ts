import { GroupPrivacy } from "../../enums";

/**
 * Update Group Interface
 * Used for updating existing groups
 */
export interface IUpdateGroup {
  /**
   * Group name
   */
  name?: string;

  /**
   * Group description
   */
  description?: string;

  /**
   * Optional logo URL
   */
  logo?: string | null;

  /**
   * Optional cover image URL
   */
  cover?: string | null;

  /**
   * City ID
   */
  cityId?: string;

  /**
   * Group privacy setting
   */
  privacy?: GroupPrivacy;

  /**
   * Optional members capacity limit
   */
  membersCapacity?: number | null;

  /**
   * Optional tag IDs to associate with the group
   */
  tagIds?: string[];

  /**
   * Whether the group is active
   */
  isActive?: boolean;
}
