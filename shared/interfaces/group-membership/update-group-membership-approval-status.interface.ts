import { ApprovalStatus } from "../../enums";

/**
 * Update Membership Status Interface
 * Used for updating a group membership status
 */
export interface IUpdateGroupMembershipApprovalStatus {
  /**
   * The new status to set for the membership
   */
  id: string;

  /**
   * The new status to set for the membership
   */
  status: ApprovalStatus;
}
