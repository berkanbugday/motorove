import { GroupPrivacy, GroupTag } from "../../enums";

/**
 * Filter Group Interface
 * Used for filtering groups in queries
 */
export interface IFilterGroup {
  /**
   * Optional city ID to filter by
   */
  cityId?: string | null;

  /**
   * Optional privacy setting to filter by
   */
  privacy?: GroupPrivacy;

  /**
   * Optional tag IDs to filter by
   */
  tags?: GroupTag[];
}
