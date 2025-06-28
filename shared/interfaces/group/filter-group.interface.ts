import { GroupMemberRole, GroupPrivacy } from "../../enums";

/**
 * Filter Group Interface
 * Used for filtering groups in queries
 */
export interface IFilterGroup {
  /**
   * Optional city ID to filter by
   */
  cityId?: string;

  /**
   * Optional privacy setting to filter by
   */
  privacy?: GroupPrivacy;

  /**
   * Optional tag IDs to filter by
   */
  tags?: string[];

  /**
   * Optional role to filter by
   */
  role?: GroupMemberRole;
}
