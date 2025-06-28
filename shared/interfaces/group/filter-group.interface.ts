import { GroupPrivacy } from "../../enums";

/**
 * Filter Group Interface
 * Used for filtering groups in queries
 */
export interface IFilterGroup {
  /**
   * Optional search term for matching name or description
   */
  searchTerm?: string;

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
  tagIds?: string[];

  /**
   * Filter by active status
   */
  isActive?: boolean;

  /**
   * Filter groups that the user is a member of
   */
  isMember?: boolean;

  /**
   * Filter groups that the user is an admin of
   */
  isAdmin?: boolean;

  /**
   * Filter groups that the user created
   */
  createdById?: string;
}
