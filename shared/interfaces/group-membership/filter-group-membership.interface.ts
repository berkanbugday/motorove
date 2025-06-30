import { GroupMemberRole, InvitationStatus } from "../../enums";

/**
 * Filter Group Membership Interface
 * Used for filtering group memberships
 */
export interface IFilterGroupMembership {
  /**
   * Filter by group ID
   */
  groupId?: string;

  /**
   * Filter by user ID
   */
  userId?: string;

  /**
   * Filter by member role
   */
  role?: GroupMemberRole;

  /**
   * Filter by invitation status
   */
  status?: InvitationStatus;

  /**
   * Filter by active status
   */
  isActive?: boolean;
}
